import { createHash } from 'crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../entities/user.entity';
import { Token } from '../entities/token.entity';
import { UserProfile } from '../entities/profile.entity';
import { UserRole } from '../../../shared/Domain/enums/user-role.enum';
import { TokenType } from '../../../shared/Domain/enums/token-type.enum';

import { TokenService, AuthResponseData, TokenPair } from './token.service';
import { SignUpDto } from '../dto/sign-up.dto';
import { SignInDto } from '../dto/sign-in.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

const BCRYPT_ROUNDS = 12;

// Raw user data received from GitHub's API
export interface GithubUserData {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  accessToken: string;
}

export interface AuthResult {
  tokens: TokenPair;
  responseData: AuthResponseData;
}

@Injectable()
export class AuthService {
  private readonly adminEmailDomain: string;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profiles: Repository<UserProfile>,
    @InjectRepository(Token) private readonly tokens: Repository<Token>,
    private readonly tokenService: TokenService,
    private readonly config: ConfigService,
  ) {
    this.adminEmailDomain = this.config.get<string>('auth.adminEmailDomain')!;
  }

  /**
   * Upserts a user from GitHub OAuth data.
   * Always sets emailVerifiedAt (GitHub has already verified the email) and
   * creates the UserProfile on first login.
   */
  async githubAuth(data: GithubUserData): Promise<AuthResult> {
    let user = await this.users.findOne({
      where: { githubId: String(data.id) },
    });

    if (!user) {
      user = this.users.create({
        githubId: String(data.id),
        githubLogin: data.login,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatar_url,
        role: UserRole.USER,
        emailVerifiedAt: new Date(),
      });
      await this.users.save(user);

      // Create the paired UserProfile (shared PK)
      await this.profiles.save(this.profiles.create({ id: user.id }));
    } else {
      // Keep GitHub data fresh on each sign-in
      await this.users.update(user.id, {
        githubLogin: data.login,
        email: data.email ?? user.email,
        name: data.name ?? user.name,
        avatarUrl: data.avatar_url,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      });
      user = (await this.users.findOne({ where: { id: user.id } }))!;
    }

    return this.buildAuthResult(user);
  }

  /**
   * Creates an unverified account. Does NOT sign the user in — they must verify
   * their email first. Sends a verification token via MailService (Commit 6).
   */
  async signUp(dto: SignUpDto): Promise<void> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email is already registered.');

    if (dto.email.endsWith(`@${this.adminEmailDomain}`)) {
      throw new BadRequestException(
        'Use the admin invitation flow for admin accounts.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await this.users.save(
      this.users.create({
        email: dto.email,
        name: dto.name ?? null,
        passwordHash,
        role: UserRole.USER,
        emailVerifiedAt: null,
      }),
    );

    await this.profiles.save(this.profiles.create({ id: user.id }));

    const rawToken = await this.issueToken(user.id, TokenType.VERIFICATION);

    // TODO (Commit 6): await this.mailService.sendVerification(user.email, rawToken);
    void rawToken; // suppress unused warning until mail service is wired
  }

  // ── Email sign-in ─────────────────────────────────────────────────────────

  async signIn(dto: SignInDto): Promise<AuthResult> {
    const user = await this.users.findOne({ where: { email: dto.email } });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException('Email not verified. Check your inbox.');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials.');

    return this.buildAuthResult(user);
  }

  // ── Forgot password ───────────────────────────────────────────────────────

  /**
   * Issues a password-reset token. Always responds with 200 regardless of
   * whether the email exists (prevents user enumeration).
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findOne({ where: { email } });
    if (!user) return; // silent no-op

    const rawToken = await this.issueToken(user.id, TokenType.PASS_RESET);

    // TODO (Commit 6): await this.mailService.sendPasswordReset(email, rawToken);
    void rawToken;
  }

  // ── Reset password ────────────────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = this.hashRawToken(dto.token);

    const record = await this.tokens.findOne({
      where: { tokenHash, type: TokenType.PASS_RESET },
    });

    this.assertTokenValid(record);

    await this.users.update(record!.userId, {
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    });

    await this.tokens.update(record!.id, { usedAt: new Date() });
  }

  // ── Email verification ────────────────────────────────────────────────────

  async verifyEmail(rawToken: string): Promise<void> {
    const tokenHash = this.hashRawToken(rawToken);

    const record = await this.tokens.findOne({
      where: { tokenHash, type: TokenType.VERIFICATION },
    });

    this.assertTokenValid(record);

    await this.users.update(record!.userId, { emailVerifiedAt: new Date() });
    await this.tokens.update(record!.id, { usedAt: new Date() });
  }

  // ── Token refresh ─────────────────────────────────────────────────────────

  /**
   * Validates the access + refresh token pair (no DB hit) and issues a new pair.
   * See TokenService.verifyRefreshPair for the digest cross-validation algorithm.
   */
  refresh(expiredAccessToken: string, refreshToken: string): TokenPair {
    const { userId, role } = this.tokenService.verifyRefreshPair(
      expiredAccessToken,
      refreshToken,
    );
    return this.tokenService.generatePair(userId, role);
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private buildAuthResult(user: User): AuthResult {
    const tokens = this.tokenService.generatePair(user.id, user.role);
    return {
      tokens,
      responseData: {
        AccessToken: tokens.accessToken,
        Role: user.role,
        Profile: {
          Email: user.email,
          Name: user.name,
          AvatarUrl: user.avatarUrl,
        },
      },
    };
  }

  /**
   * Generates a cryptographically random token, stores its SHA-256 hash,
   * and returns the raw value to be sent to the user once.
   */
  private async issueToken(userId: string, type: TokenType): Promise<string> {
    // Invalidate any existing unused token of the same type for this user
    await this.tokens
      .createQueryBuilder()
      .update()
      .set({ usedAt: new Date() })
      .where('user_id = :userId AND type = :type AND used_at IS NULL', {
        userId,
        type,
      })
      .execute();

    const raw =
      crypto.randomUUID().replace(/-/g, '') +
      crypto.randomUUID().replace(/-/g, '');
    const hash = this.hashRawToken(raw);

    const expiresAt = new Date(Date.now() + 60 * 60 * 1_000); // 1 hour

    await this.tokens.save(
      this.tokens.create({ userId, type, tokenHash: hash, expiresAt }),
    );

    return raw;
  }

  private hashRawToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private assertTokenValid(record: Token | null): void {
    if (!record) throw new BadRequestException('Invalid or expired token.');
    if (record.usedAt)
      throw new BadRequestException('Token has already been used.');
    if (record.expiresAt < new Date())
      throw new BadRequestException('Token has expired.');
  }
}

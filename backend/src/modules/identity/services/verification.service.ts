import { createHash } from 'crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from '../entities/user.entity';
import { Token } from '../entities/token.entity';
import { TokenType } from '../../../shared/Domain/enums/token-type.enum';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { MailFactory } from '../factories/Mail.Factory';

const BCRYPT_ROUNDS = 12;
const TOKEN_TTL_MS = 60 * 60 * 1_000; // 1 hour

/**
 * Handles single-use email tokens (address verification + password reset):
 * issuing them, mailing the link, and redeeming them. Tokens are stored only
 * as SHA-256 hashes; the raw value is shown to the user once.
 */
@Injectable()
export class VerificationService {
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Token) private readonly tokens: Repository<Token>,
    private readonly config: ConfigService,
    private readonly mailFactory: MailFactory,
  ) {
    this.frontendUrl = this.config.get<string>('app.frontendUrl')!;
  }

  /** Issues a verification token for a new account and emails the link. */
  async sendAccountVerification(user: User): Promise<void> {
    const rawToken = await this.issueToken(user.id, TokenType.VERIFICATION);
    const url = `${this.frontendUrl}/auth/verify-email?token=${rawToken}`;
    await this.mailFactory.sendVerification(user.email!, user.name, url);
  }

  /**
   * Issues a password-reset token. Always resolves regardless of whether the
   * email exists, to prevent user enumeration.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.users.findOne({ where: { email } });
    if (!user) return; // silent no-op

    const rawToken = await this.issueToken(user.id, TokenType.PASS_RESET);
    const url = `${this.frontendUrl}/auth/reset-password?token=${rawToken}`;
    await this.mailFactory.sendPasswordReset(user.email!, user.name, url);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const record = await this.tokens.findOne({
      where: {
        tokenHash: this.hashRawToken(dto.token),
        type: TokenType.PASS_RESET,
      },
    });

    this.assertTokenValid(record);

    await this.users.update(record!.userId, {
      passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
    });

    await this.tokens.update(record!.id, { usedAt: new Date() });
  }

  async verifyEmail(rawToken: string): Promise<void> {
    const record = await this.tokens.findOne({
      where: {
        tokenHash: this.hashRawToken(rawToken),
        type: TokenType.VERIFICATION,
      },
    });

    this.assertTokenValid(record);

    await this.users.update(record!.userId, { emailVerifiedAt: new Date() });
    await this.tokens.update(record!.id, { usedAt: new Date() });
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Generates a cryptographically random token, invalidates any prior unused
   * token of the same type, stores the SHA-256 hash, and returns the raw value.
   */
  private async issueToken(userId: string, type: TokenType): Promise<string> {
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

    await this.tokens.save(
      this.tokens.create({
        userId,
        type,
        tokenHash: this.hashRawToken(raw),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      }),
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

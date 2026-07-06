import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { TokenService, AuthResult, TokenPair } from './token.service';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1_000;

/**
 * Owns the lifecycle of authenticated sessions: issuing token pairs, persisting
 * the revocable `sessions` row, refreshing pairs, and revoking on logout.
 * The stateless crypto lives in {@link TokenService}; this service adds the
 * database-backed revocation layer.
 */
@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session) private readonly sessions: Repository<Session>,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Issues a fresh token pair for a signed-in user and records the session so
   * it can later be revoked. Returns the tokens plus the client response payload.
   */
  async createSession(user: User): Promise<AuthResult> {
    const tokens = this.tokenService.generatePair(user.id, user.role);

    await this.sessions.save(
      this.sessions.create({
        userId: user.id,
        sit: tokens.sit,
        secretHash: null,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        ipAddress: null,
        userAgent: null,
        revokedAt: null,
      }),
    );

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
   * Validates the access + refresh pair, confirms the session is still live,
   * then issues a new pair reusing the same `sit` so the session row persists.
   */
  async refresh(
    expiredAccessToken: string,
    refreshToken: string,
  ): Promise<TokenPair> {
    const { userId, role, sit } = this.tokenService.verifyRefreshPair(
      expiredAccessToken,
      refreshToken,
    );

    const session = await this.sessions.findOne({ where: { userId, sit } });

    if (!session || session.revokedAt) {
      throw new UnauthorizedException('Session has been revoked.');
    }

    const newPair = this.tokenService.generatePair(userId, role, sit);

    await this.sessions.update(session.id, {
      lastActiveAt: new Date(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    });

    return newPair;
  }

  /**
   * Revokes the session identified by the refresh token's `sit` claim.
   * A missing or tampered token is a silent no-op — the caller clears the
   * cookie regardless.
   */
  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    let userId: string;
    let sit: number;

    try {
      ({ userId, sit } = this.tokenService.decodeRefresh(refreshToken));
    } catch {
      return; // tampered token — nothing to revoke
    }

    await this.sessions
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND sit = :sit AND revoked_at IS NULL', {
        userId,
        sit,
      })
      .execute();
  }
}

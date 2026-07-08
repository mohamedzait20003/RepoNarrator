import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import {
  TokenService,
  AuthResult,
  TokenPair,
  SessionInfo,
} from './token.service';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1_000;

/** Request metadata captured when a session is created. */
export interface SessionContext {
  ipAddress: string | null;
  userAgent: string | null;
}

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
   * Issues a fresh token pair for a signed-in user and records the session
   * (with its device/IP context) so it can later be revoked. Returns the tokens
   * plus the client response payload, including the account's active sessions.
   */
  async createSession(
    user: User,
    context?: SessionContext,
  ): Promise<AuthResult> {
    const tokens = this.tokenService.generatePair(user.id, user.role);

    await this.sessions.save(
      this.sessions.create({
        userId: user.id,
        sit: tokens.sit,
        secretHash: null,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        ipAddress: context?.ipAddress ?? null,
        userAgent: context?.userAgent ?? null,
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
          GithubLinked: Boolean(user.githubId),
          Sessions: await this.getActiveSessions(user.id),
        },
      },
    };
  }

  /**
   * Lists the account's active (non-revoked, unexpired) sessions as
   * device/location descriptors, most-recently-active first.
   */
  private async getActiveSessions(userId: string): Promise<SessionInfo[]> {
    const rows = await this.sessions.find({
      where: { userId, revokedAt: IsNull(), expiresAt: MoreThan(new Date()) },
      order: { lastActiveAt: 'DESC' },
    });

    return rows.map((row) => ({
      Location: resolveLocation(row.ipAddress),
      DeviceType: parseDeviceType(row.userAgent),
    }));
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

/** Coarse device descriptor (kind + browser) from a User-Agent string. */
function parseDeviceType(ua: string | null): string | null {
  if (!ua) return null;

  const kind = /iPad|Tablet/i.test(ua)
    ? 'Tablet'
    : /Mobi|Android|iPhone|iPod/i.test(ua)
      ? 'Mobile'
      : 'Desktop';

  const browser = /Edg/i.test(ua)
    ? 'Edge'
    : /OPR|Opera/i.test(ua)
      ? 'Opera'
      : /Firefox/i.test(ua)
        ? 'Firefox'
        : /Chrome/i.test(ua)
          ? 'Chrome'
          : /Safari/i.test(ua)
            ? 'Safari'
            : null;

  return browser ? `${kind} · ${browser}` : kind;
}

/**
 * Best-effort location from an IP. Loopback/private ranges resolve to "Local";
 * plug a geo-IP provider in here to resolve public IPs to a city/country.
 */
function resolveLocation(ip: string | null): string | null {
  if (!ip) return null;

  const addr = ip.replace(/^::ffff:/, '');
  const isLocal =
    addr === '::1' ||
    addr === '127.0.0.1' ||
    addr.startsWith('10.') ||
    addr.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(addr);

  return isLocal ? 'Local' : null;
}

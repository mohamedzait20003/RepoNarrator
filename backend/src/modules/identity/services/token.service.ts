import { createHmac } from 'crypto';
import type { StringValue } from 'ms';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import type { ITokenService } from '../../../shared/Contracts/token-service.contract';

/**
 * Payload embedded in the access JWT.
 * `dig` = HMAC-SHA256(sub:role:sit, digestSecret).
 * `sit` = session-issued-at (unix seconds) — shared with the refresh token
 *          and used as the stable session identifier in the `sessions` table.
 */
export interface AccessTokenPayload {
  sub: string;
  role: string;
  dig: string;
  sit: number;
  type: 'access';
  iat?: number;
  exp?: number;
}

/**
 * Payload embedded in the refresh JWT.
 * Carries the same `dig` and `sit` as its paired access token so both can be
 * cross-validated without a database lookup.
 */
export interface RefreshTokenPayload {
  sub: string;
  role: string;
  dig: string;
  sit: number;
  type: 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** The `sit` embedded in both tokens — use this to create / look up the session row. */
  sit: number;
}

/** A currently-active session for the account (device/where signed in). */
export interface SessionInfo {
  Location: string | null;
  DeviceType: string | null;
}

/** Profile snippet returned to the client on sign-in / GitHub sign. */
export interface AuthProfile {
  Email: string | null;
  Name: string | null;
  AvatarUrl: string | null;
  /** Whether a GitHub account is linked (repos can be synced). */
  GithubLinked: boolean;
  /** Active (non-revoked, unexpired) sessions for this account. */
  Sessions: SessionInfo[];
}

/** Shape of the sign-in / GitHub-sign response Data payload. */
export interface AuthResponseData {
  AccessToken: string;
  Role: string;
  Profile: AuthProfile;
}

/** Shape of the refresh response Data payload. */
export interface RefreshResponseData {
  AccessToken: string;
}

/** A freshly-issued token pair plus the response payload for the client. */
export interface AuthResult {
  tokens: TokenPair;
  responseData: AuthResponseData;
}

// Service

@Injectable()
export class TokenService implements ITokenService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly digestSecret: string;
  private readonly accessExpiry: string;
  private readonly refreshExpiry: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.accessSecret = this.config.get<string>('auth.accessSecret')!;
    this.refreshSecret = this.config.get<string>('auth.refreshSecret')!;
    this.digestSecret = this.config.get<string>('auth.digestSecret')!;
    this.accessExpiry = this.config.get<string>('auth.accessExpiry')!;
    this.refreshExpiry = this.config.get<string>('auth.refreshExpiry')!;
  }

  private deriveDigest(userId: string, role: string, sit: number): string {
    return createHmac('sha256', this.digestSecret)
      .update(`${userId}:${role}:${sit}`)
      .digest('hex');
  }

  /**
   * Issues a fresh access + refresh token pair for a user.
   * Both tokens share the same `sit` (session-issued-at) and `dig` (digest).
   *
   * Pass an existing `sit` on refresh so the session row stays the same.
   * Omit it (or pass undefined) on initial sign-in to start a new session.
   */
  generatePair(userId: string, role: string, existingSit?: number): TokenPair {
    const sit = existingSit ?? Math.floor(Date.now() / 1000);
    const dig = this.deriveDigest(userId, role, sit);

    const sharedClaims = { sub: userId, role, dig, sit };

    const accessToken = this.jwt.sign(
      { ...sharedClaims, type: 'access' } satisfies Omit<
        AccessTokenPayload,
        'iat' | 'exp'
      >,
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiry as StringValue,
      },
    );

    const refreshToken = this.jwt.sign(
      { ...sharedClaims, type: 'refresh' } satisfies Omit<
        RefreshTokenPayload,
        'iat' | 'exp'
      >,
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiry as StringValue,
      },
    );

    return { accessToken, refreshToken, sit };
  }

  /**
   * Verifies an access token on protected routes.
   * Re-derives the digest from the token's own claims — pure crypto, no DB hit.
   */
  verifyAccess(token: string): AccessTokenPayload {
    let payload: AccessTokenPayload;
    try {
      payload = this.jwt.verify<AccessTokenPayload>(token, {
        secret: this.accessSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token.');
    }

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Wrong token type.');
    }

    if (
      payload.dig !== this.deriveDigest(payload.sub, payload.role, payload.sit)
    ) {
      throw new UnauthorizedException('Token digest mismatch.');
    }

    return payload;
  }

  /**
   * Validates a refresh attempt without any database lookup.
   *
   * Algorithm:
   * 1. Decode the expired access token (signature still checked, expiry ignored).
   * 2. Fully verify the refresh token (signature + expiry).
   * 3. Re-derive the expected digest from the refresh token's own claims.
   * 4. Assert: refresh.dig === expected AND refresh.dig === access.dig.
   *    → Proves both tokens originated from the same login session.
   *
   * Returns the identity context needed to issue a new token pair.
   */
  verifyRefreshPair(
    expiredAccessToken: string,
    refreshToken: string,
  ): { userId: string; role: string; sit: number } {
    // Step 1 — decode (do NOT verify expiry) the access token.
    let accessPayload: AccessTokenPayload | null;
    try {
      accessPayload = this.jwt.decode<AccessTokenPayload>(expiredAccessToken);
    } catch {
      accessPayload = null;
    }

    if (!accessPayload || accessPayload.type !== 'access') {
      throw new UnauthorizedException(
        'Invalid access token presented for refresh.',
      );
    }

    // Step 2 — fully verify the refresh token.
    let refreshPayload: RefreshTokenPayload;
    try {
      refreshPayload = this.jwt.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    if (refreshPayload.type !== 'refresh') {
      throw new UnauthorizedException('Wrong token type.');
    }

    // Step 3 — re-derive expected digest from refresh token's own claims.
    const expectedDig = this.deriveDigest(
      refreshPayload.sub,
      refreshPayload.role,
      refreshPayload.sit,
    );

    // Step 4 — cross-validate. Both conditions must hold simultaneously.
    const digestValid = refreshPayload.dig === expectedDig;
    const pairMatch = refreshPayload.dig === accessPayload.dig;

    if (!digestValid || !pairMatch) {
      throw new UnauthorizedException(
        'Token pair mismatch — possible session hijack.',
      );
    }

    return {
      userId: refreshPayload.sub,
      role: refreshPayload.role,
      sit: refreshPayload.sit,
    };
  }

  /**
   * Verifies the refresh token signature (ignoring expiry) and returns its claims.
   * Used during logout to identify which session to revoke.
   */
  decodeRefresh(token: string): { userId: string; sit: number } {
    let payload: RefreshTokenPayload;
    try {
      payload = this.jwt.verify<RefreshTokenPayload>(token, {
        secret: this.refreshSecret,
        ignoreExpiration: true,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Wrong token type.');
    }

    return { userId: payload.sub, sit: payload.sit };
  }
}

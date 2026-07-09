import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

import { TokenService } from '@/modules/identity/services/token.service';

const SECRETS: Record<string, string> = {
  'auth.accessSecret': 'access-secret',
  'auth.refreshSecret': 'refresh-secret',
  'auth.digestSecret': 'digest-secret',
  'auth.accessExpiry': '15m',
  'auth.refreshExpiry': '7d',
};

function makeConfig(overrides: Record<string, string> = {}): ConfigService {
  const map = { ...SECRETS, ...overrides };
  return { get: (key: string) => map[key] } as unknown as ConfigService;
}

function makeService(overrides?: Record<string, string>): TokenService {
  return new TokenService(new JwtService({}), makeConfig(overrides));
}

describe('TokenService', () => {
  const service = makeService();

  describe('generatePair', () => {
    it('issues a paired access + refresh token sharing one sit', () => {
      const pair = service.generatePair('user-1', 'user');

      expect(typeof pair.accessToken).toBe('string');
      expect(typeof pair.refreshToken).toBe('string');
      expect(typeof pair.sit).toBe('number');
    });

    it('reuses an existing sit when provided (refresh path)', () => {
      const pair = service.generatePair('user-1', 'user', 1234);
      expect(pair.sit).toBe(1234);
    });
  });

  describe('verifyAccess', () => {
    it('accepts a freshly generated access token and returns its claims', () => {
      const { accessToken } = service.generatePair('user-1', 'super_admin');

      const claims = service.verifyAccess(accessToken);

      expect(claims.sub).toBe('user-1');
      expect(claims.role).toBe('super_admin');
      expect(claims.type).toBe('access');
    });

    it('rejects a malformed token', () => {
      expect(() => service.verifyAccess('not-a-jwt')).toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a refresh token presented as an access token', () => {
      const { refreshToken } = service.generatePair('user-1', 'user');
      expect(() => service.verifyAccess(refreshToken)).toThrow(
        UnauthorizedException,
      );
    });

    it('rejects a token whose digest was forged (different digest secret)', () => {
      const signer = makeService();
      // Same access secret (signature verifies) but a different digest secret.
      const verifier = makeService({ 'auth.digestSecret': 'other-secret' });

      const { accessToken } = signer.generatePair('user-1', 'user');

      expect(() => verifier.verifyAccess(accessToken)).toThrow(
        /digest mismatch/i,
      );
    });
  });

  describe('verifyRefreshPair', () => {
    it('accepts a matching access + refresh pair', () => {
      const { accessToken, refreshToken, sit } = service.generatePair(
        'user-9',
        'user',
      );

      const result = service.verifyRefreshPair(accessToken, refreshToken);

      expect(result).toEqual({ userId: 'user-9', role: 'user', sit });
    });

    it('rejects a mismatched pair from two different sessions', () => {
      const a = service.generatePair('user-9', 'user');
      // Force a distinct sit so the digests cannot line up.
      const b = service.generatePair('user-9', 'user', a.sit + 1);

      expect(() =>
        service.verifyRefreshPair(a.accessToken, b.refreshToken),
      ).toThrow(/mismatch/i);
    });

    it('rejects when the refresh token is invalid', () => {
      const { accessToken } = service.generatePair('user-9', 'user');
      expect(() => service.verifyRefreshPair(accessToken, 'garbage')).toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('decodeRefresh', () => {
    it('returns userId + sit from a valid refresh token', () => {
      const { refreshToken, sit } = service.generatePair('user-3', 'user');
      expect(service.decodeRefresh(refreshToken)).toEqual({
        userId: 'user-3',
        sit,
      });
    });

    it('rejects an access token', () => {
      const { accessToken } = service.generatePair('user-3', 'user');
      expect(() => service.decodeRefresh(accessToken)).toThrow(
        UnauthorizedException,
      );
    });
  });
});

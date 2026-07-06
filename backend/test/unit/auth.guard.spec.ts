import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { AuthGuard } from '../../src/shared/Guards/auth.guard';
import { ITokenService } from '../../src/shared/Contracts/token-service.contract';

const REFRESH_COOKIE = 'rnt';

function makeConfig(): ConfigService {
  return {
    get: (key: string) =>
      key === 'auth.refreshCookieName' ? REFRESH_COOKIE : undefined,
  } as unknown as ConfigService;
}

function contextWith(req: Partial<Request>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let tokens: jest.Mocked<ITokenService>;
  let guard: AuthGuard;

  beforeEach(() => {
    tokens = {
      verifyAccess: jest.fn(),
      verifyRefreshPair: jest.fn(),
      decodeRefresh: jest.fn(),
    };
    guard = new AuthGuard(tokens, makeConfig());
  });

  it('allows a valid access token and attaches the user', () => {
    tokens.verifyAccess.mockReturnValue({
      sub: 'user-1',
      role: 'user',
      dig: 'd',
      sit: 100,
      type: 'access',
    });

    const req: Partial<Request> = {
      headers: { authorization: 'Bearer good-token' },
      cookies: {},
    };
    const ctx = contextWith(req);

    expect(guard.canActivate(ctx)).toBe(true);
    expect(req.user).toEqual({ userId: 'user-1', role: 'user', sit: 100 });
    // Verifies extractBearer stripped the "Bearer " prefix.
    expect(tokens.verifyAccess.mock.calls[0][0]).toBe('good-token');
  });

  it('rejects a request with no Authorization header', () => {
    const ctx = contextWith({ headers: {}, cookies: {} });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects an invalid access token when no refresh cookie is present', () => {
    tokens.verifyAccess.mockImplementation(() => {
      throw new UnauthorizedException('bad');
    });

    const ctx = contextWith({
      headers: { authorization: 'Bearer expired' },
      cookies: {},
    });

    expect(() => guard.canActivate(ctx)).toThrow(
      /invalid or expired access token/i,
    );
  });

  it('reports an expired token when a valid refresh pair is present', () => {
    tokens.verifyAccess.mockImplementation(() => {
      throw new UnauthorizedException('expired');
    });
    tokens.verifyRefreshPair.mockReturnValue({
      userId: 'user-1',
      role: 'user',
      sit: 100,
    });

    const ctx = contextWith({
      headers: { authorization: 'Bearer expired' },
      cookies: { [REFRESH_COOKIE]: 'refresh-token' },
    });

    expect(() => guard.canActivate(ctx)).toThrow(/access token expired/i);
  });
});

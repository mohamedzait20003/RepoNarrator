import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { AuthGuard } from '../../src/shared/Guards/auth.guard';
import { ITokenService } from '../../src/shared/Contracts/token-service.contract';
import { UserRole } from '../../src/shared/Domain/enums/user-role.enum';

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
    getHandler: () => null,
    getClass: () => null,
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let tokens: jest.Mocked<ITokenService>;
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let guard: AuthGuard;

  beforeEach(() => {
    tokens = {
      verifyAccess: jest.fn(),
      verifyRefreshPair: jest.fn(),
      decodeRefresh: jest.fn(),
    };
    // Default: no @Roles metadata -> authentication alone suffices.
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) };
    guard = new AuthGuard(
      tokens,
      reflector as unknown as Reflector,
      makeConfig(),
    );
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

  it('allows an authenticated user whose role satisfies @Roles', () => {
    tokens.verifyAccess.mockReturnValue({
      sub: 'admin-1',
      role: 'super_admin',
      dig: 'd',
      sit: 100,
      type: 'access',
    });
    reflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);

    const ctx = contextWith({
      headers: { authorization: 'Bearer good' },
      cookies: {},
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects with 403 when the role is not permitted', () => {
    tokens.verifyAccess.mockReturnValue({
      sub: 'user-1',
      role: 'user',
      dig: 'd',
      sit: 100,
      type: 'access',
    });
    reflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);

    const ctx = contextWith({
      headers: { authorization: 'Bearer good' },
      cookies: {},
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

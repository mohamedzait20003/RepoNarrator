import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from '../../src/shared/Guards/roles.guard';
import { UserRole } from '../../src/shared/Domain/enums/user-role.enum';

function contextWith(user: unknown): ExecutionContext {
  return {
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows routes with no @Roles metadata', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextWith({ role: UserRole.USER }))).toBe(true);
  });

  it('allows a user whose role is in the required set', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);
    expect(guard.canActivate(contextWith({ role: UserRole.SUPER_ADMIN }))).toBe(
      true,
    );
  });

  it('rejects a user whose role is not permitted', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.SUPER_ADMIN]);
    expect(() =>
      guard.canActivate(contextWith({ role: UserRole.USER })),
    ).toThrow(ForbiddenException);
  });

  it('rejects when no authenticated user is present', () => {
    reflector.getAllAndOverride.mockReturnValue([UserRole.SUPPORT]);
    expect(() => guard.canActivate(contextWith(undefined))).toThrow(
      ForbiddenException,
    );
  });
});

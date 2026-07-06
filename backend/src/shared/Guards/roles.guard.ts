import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { UserRole } from '../Domain/enums/user-role.enum';
import { ROLES_KEY } from '../Decorators/roles.decorator';
// Pulls in the `Request.user` augmentation so `req.user` is typed here too.
import '../Contracts/authenticated-user.contract';

/**
 * Enforces `@Roles(...)` metadata. Runs AFTER `AuthGuard`, which populates
 * `request.user`. Routes with no `@Roles()` metadata are allowed through
 * (authentication alone suffices).
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const role = req.user?.role;

    if (!role || !required.includes(role)) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    return true;
  }
}

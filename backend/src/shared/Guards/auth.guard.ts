import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { TOKEN_SERVICE } from '../Contracts/token-service.contract';
import type { ITokenService } from '../Contracts/token-service.contract';
import { UserRole } from '../Domain/enums/user-role.enum';
import type { AuthenticatedUser } from '../Contracts/authenticated-user.contract';

/** Metadata key holding the roles allowed on a route — set by the `@Roles()` decorator. */
export const ROLES_KEY = 'roles';

/**
 * The single route guard. Authenticates the access token and, when the route
 * carries `@Roles(...)` metadata, authorizes the caller's role.
 *
 * Auth: the `Authorization: Bearer <accessToken>` header is verified with the
 * identity TokenService (via the {@link TOKEN_SERVICE} contract — pure crypto,
 * no DB) and the identity is attached to `request.user`. If the access token is
 * expired/invalid but a refresh cookie is present, `verifyRefreshPair`
 * distinguishes an expired-but-refreshable pair (distinct 401 → the client
 * should call `/auth/refresh`) from a broken one.
 *
 * Authz: `@Roles(...)` metadata is read via the Reflector; a mismatch is 403.
 * No `@Roles(...)` roles → authentication alone suffices.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly refreshCookieName: string;

  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
    private readonly reflector: Reflector,
    config: ConfigService,
  ) {
    this.refreshCookieName = config.get<string>('auth.refreshCookieName')!;
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const accessToken = this.extractBearer(req);
    if (!accessToken) {
      throw new UnauthorizedException('Missing access token.');
    }

    try {
      const claims = this.tokens.verifyAccess(accessToken);
      req.user = {
        userId: claims.sub,
        role: claims.role as UserRole,
        sit: claims.sit,
      } satisfies AuthenticatedUser;
    } catch {
      // Access token failed — assertRefreshable always throws a precise 401.
      this.assertRefreshable(req, accessToken);
    }

    // Authenticated (the catch above always throws); now authorize the role.
    this.assertRole(context, req.user.role);
    return true;
  }

  /** Enforces `@Roles(...)` metadata. No roles declared → authentication suffices. */
  private assertRole(context: ExecutionContext, role: UserRole): void {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (required && required.length > 0 && !required.includes(role)) {
      throw new ForbiddenException('Insufficient permissions.');
    }
  }

  /**
   * Inspects the refresh cookie (when present) to produce a precise 401.
   * Always throws.
   */
  private assertRefreshable(req: Request, accessToken: string): never {
    const cookies = req.cookies as Record<string, string | undefined>;
    const refreshToken = cookies?.[this.refreshCookieName];

    if (refreshToken) {
      let pairValid = false;
      try {
        this.tokens.verifyRefreshPair(accessToken, refreshToken);
        pairValid = true;
      } catch {
        pairValid = false;
      }
      // Pair is authentic — the access token has simply expired.
      if (pairValid) throw new UnauthorizedException('Access token expired.');
    }

    throw new UnauthorizedException('Invalid or expired access token.');
  }

  private extractBearer(req: Request): string | undefined {
    const header = req.headers.authorization;
    return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  }
}

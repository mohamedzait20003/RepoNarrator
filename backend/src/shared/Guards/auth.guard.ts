import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { TOKEN_SERVICE } from '../Contracts/token-service.contract';
import type { ITokenService } from '../Contracts/token-service.contract';
import { UserRole } from '../Domain/enums/user-role.enum';
import type { AuthenticatedUser } from '../Contracts/authenticated-user.contract';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly refreshCookieName: string;

  constructor(
    @Inject(TOKEN_SERVICE) private readonly tokens: ITokenService,
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
      return true;
    } catch {
      // Access token failed — see whether a refresh token can explain it.
      this.assertRefreshable(req, accessToken);
      // assertRefreshable always throws; this is unreachable.
      return false;
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

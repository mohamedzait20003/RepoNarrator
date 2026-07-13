import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { QuotaKind } from '@/shared/Domain/enums/quota-kind.enum';
import { QuotaService } from '@/modules/subscription/services/quota.service';

export const QUOTA_KEY = 'quota';

@Injectable()
export class QuotaGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly quota: QuotaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const kind = this.reflector.getAllAndOverride<QuotaKind | undefined>(
      QUOTA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!kind) return true;

    const req = context.switchToHttp().getRequest<Request>();
    if (!req.user) {
      throw new UnauthorizedException('Not authenticated.');
    }

    await this.quota.reserve(req.user.userId, kind);
    return true;
  }
}

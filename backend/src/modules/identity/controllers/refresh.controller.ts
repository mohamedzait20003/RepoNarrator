import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { BaseController } from './base.controller';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class RefreshController extends BaseController {
  private readonly refreshCookieName: string;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    super();
    this.refreshCookieName = this.config.get<string>('auth.refreshCookieName')!;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = (req.cookies as Record<string, string>)[
      this.refreshCookieName
    ];
    const authHeader = req.headers.authorization;
    const expiredAccessToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;

    if (!refreshToken || !expiredAccessToken) {
      throw new UnauthorizedException(
        'Refresh and access tokens are both required.',
      );
    }

    const newPair = await this.authService.refresh(
      expiredAccessToken,
      refreshToken,
    );

    // Rotate the refresh token cookie
    res.cookie(this.refreshCookieName, newPair.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1_000,
      path: '/api/v1/auth',
    });

    return this.ok<{ AccessToken: string }>(
      { AccessToken: newPair.accessToken },
      'Token refreshed.',
    );
  }
}

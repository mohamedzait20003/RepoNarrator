import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import { BaseController } from './base.controller';
import { AuthService } from '../services/auth.service';
import { SignInDto } from '../dto/sign-in.dto';
import { AuthThrottle } from '../../../shared/Decorators/auth-throttle.decorator';

@Controller('auth')
@AuthThrottle()
export class SignInController extends BaseController {
  private readonly refreshCookieName: string;

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {
    super();
    this.refreshCookieName = this.config.get<string>('auth.refreshCookieName')!;
  }

  /**
   * Authenticates an email+password account.
   * Returns { AccessToken, Role, Profile } — refresh token goes to HttpOnly cookie.
   */
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, responseData } = await this.authService.signIn(dto);

    res.cookie(this.refreshCookieName, tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1_000,
      path: '/api/v1/auth',
    });

    return this.ok(responseData, 'Signed in successfully.');
  }
}

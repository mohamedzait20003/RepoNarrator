import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { BaseController } from './base.controller';
import { AuthService } from '../services/auth.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';

@Controller('auth')
export class ForgotPasswordController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * Sends a password-reset email.
   * Always returns 200 regardless of whether the email is registered
   * to prevent user-enumeration attacks.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return this.message(
      'If that email is registered you will receive a reset link shortly.',
    );
  }
}

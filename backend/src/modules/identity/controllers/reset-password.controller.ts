import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { BaseController } from './base.controller';
import { AuthService } from '../services/auth.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@Controller('auth')
export class ResetPasswordController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return this.message(
      'Password updated. You can now sign in with your new password.',
    );
  }
}

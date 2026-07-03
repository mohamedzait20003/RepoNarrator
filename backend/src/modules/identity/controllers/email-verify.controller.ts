import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { BaseController } from './base.controller';
import { AuthService } from '../services/auth.service';
import { EmailVerifyDto } from '../dto/email-verify.dto';

@Controller('auth')
export class EmailVerifyController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: EmailVerifyDto) {
    await this.authService.verifyEmail(dto.token);
    return this.message('Email verified. You can now sign in.');
  }
}

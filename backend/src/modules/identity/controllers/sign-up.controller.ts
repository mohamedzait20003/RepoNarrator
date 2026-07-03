import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { BaseController } from './base.controller';
import { AuthService } from '../services/auth.service';
import { SignUpDto } from '../dto/sign-up.dto';

@Controller('auth')
export class SignUpController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * Creates an unverified account and sends a verification email.
   * The user cannot sign in until they verify their email.
   */
  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: SignUpDto) {
    await this.authService.signUp(dto);
    return this.message(
      'Account created. Check your email to verify your address.',
    );
  }
}

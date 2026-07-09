import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { BaseController } from '@/modules/identity/controllers/base.controller';
import { AuthService } from '@/modules/identity/services/auth.service';
import { SignUpDto } from '@/modules/identity/dto/sign-up.dto';
import { AuthThrottle } from '@/shared/Decorators/auth-throttle.decorator';

@Controller('auth')
@AuthThrottle()
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

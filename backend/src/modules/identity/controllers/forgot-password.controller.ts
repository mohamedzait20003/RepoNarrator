import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { BaseController } from '@/shared/Domain/base.controller';
import { VerificationService } from '@/modules/identity/services/verification.service';
import { ForgotPasswordDto } from '@/modules/identity/dto/forgot-password.dto';
import { AuthThrottle } from '@/shared/Decorators/auth-throttle.decorator';

@Controller('auth')
@AuthThrottle()
export class ForgotPasswordController extends BaseController {
  constructor(private readonly verificationService: VerificationService) {
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
    await this.verificationService.forgotPassword(dto.email);
    return this.message(
      'If that email is registered you will receive a reset link shortly.',
    );
  }
}

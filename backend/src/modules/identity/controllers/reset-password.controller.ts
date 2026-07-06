import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { BaseController } from './base.controller';
import { VerificationService } from '../services/verification.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthThrottle } from '../../../shared/Decorators/auth-throttle.decorator';

@Controller('auth')
@AuthThrottle()
export class ResetPasswordController extends BaseController {
  constructor(private readonly verificationService: VerificationService) {
    super();
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.verificationService.resetPassword(dto);
    return this.message(
      'Password updated. You can now sign in with your new password.',
    );
  }
}

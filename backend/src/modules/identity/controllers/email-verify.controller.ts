import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { BaseController } from '@/modules/identity/controllers/base.controller';
import { VerificationService } from '@/modules/identity/services/verification.service';
import { EmailVerifyDto } from '@/modules/identity/dto/email-verify.dto';
import { AuthThrottle } from '@/shared/Decorators/auth-throttle.decorator';

@Controller('auth')
@AuthThrottle()
export class EmailVerifyController extends BaseController {
  constructor(private readonly verificationService: VerificationService) {
    super();
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: EmailVerifyDto) {
    await this.verificationService.verifyEmail(dto.token);
    return this.message('Email verified. You can now sign in.');
  }
}

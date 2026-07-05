import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { UserProfile } from './entities/profile.entity';
import { Token } from './entities/token.entity';
import { Session } from './entities/session.entity';

import { TokenService } from './services/token.service';
import { AuthService } from './services/auth.service';
import { MailFactory } from './factories/Mail.Factory';

import { GithubController } from './controllers/github.controller';
import { SignUpController } from './controllers/sign-up.controller';
import { SignInController } from './controllers/sign-in.controller';
import { ForgotPasswordController } from './controllers/forgot-password.controller';
import { ResetPasswordController } from './controllers/reset-password.controller';
import { RefreshController } from './controllers/refresh.controller';
import { EmailVerifyController } from './controllers/email-verify.controller';
import { LogoutController } from './controllers/logout.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Token, Session]),

    // JwtModule with no defaults — TokenService supplies secrets per-call via ConfigService.
    JwtModule.register({}),
  ],
  controllers: [
    GithubController,
    SignUpController,
    SignInController,
    ForgotPasswordController,
    ResetPasswordController,
    RefreshController,
    EmailVerifyController,
    LogoutController,
  ],
  providers: [TokenService, AuthService, MailFactory],
  exports: [TokenService],
})
export class IdentityModule {}

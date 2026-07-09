import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseMailFactory } from '@/shared/Factories/base-mail.factory';

@Injectable()
export class MailFactory extends BaseMailFactory {
  constructor(config: ConfigService) {
    super(config);
  }

  async sendVerification(
    email: string,
    name: string | null,
    verificationUrl: string,
  ): Promise<void> {
    await this.enqueue({
      to: { email, name: name ?? email },
      subject: 'Verify your RepoNarrator email',
      view: 'verify-email',
      data: { name: name ?? '', url: verificationUrl },
    });
  }

  async sendPasswordReset(
    email: string,
    name: string | null,
    resetUrl: string,
  ): Promise<void> {
    await this.enqueue({
      to: { email, name: name ?? email },
      subject: 'Reset your RepoNarrator password',
      view: 'password-reset',
      data: { url: resetUrl },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseQueueFactory } from '@/shared/Factories/base-queue.factory';

/** Serialised payload enqueued by MailFactory and consumed by the mail worker. */
export interface EmailJobPayload {
  to: { email: string; name: string };
  subject: string;
  view: string;
  data: Record<string, unknown>;
}

/** Enqueues transactional emails onto the shared mail queue. */
@Injectable()
export class MailFactory extends BaseQueueFactory<EmailJobPayload> {
  constructor(config: ConfigService) {
    super(config, 'email', 'mail.send');
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

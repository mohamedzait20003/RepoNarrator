import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import type { BaseMailer } from '../../../shared/Mail/base.mailer';
import type { EmailJobPayload } from '../../../../workers/mail/types';
import { VerificationMailer } from '../mailers/Verification.Mailer';
import { PasswordResetMailer } from '../mailers/PasswordReset.Mailer';

@Injectable()
export class MailFactory implements OnApplicationShutdown {
  private readonly logger = new Logger(MailFactory.name);
  private readonly queue: Queue<EmailJobPayload>;
  private readonly connection: IORedis;

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.get<string>('redis.url')!;

    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.queue = new Queue<EmailJobPayload>('email', {
      connection: this.connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 100 },
      },
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.queue.close();
    await this.connection.quit();
  }

  async sendVerification(
    email: string,
    name: string | null,
    verificationUrl: string,
  ): Promise<void> {
    await this.enqueue(new VerificationMailer(email, name, verificationUrl));
  }

  async sendPasswordReset(
    email: string,
    name: string | null,
    resetUrl: string,
  ): Promise<void> {
    await this.enqueue(new PasswordResetMailer(email, name, resetUrl));
  }

  private async enqueue<T extends object>(
    mailer: BaseMailer<T>,
  ): Promise<void> {
    const payload: EmailJobPayload = {
      envelope: mailer.envelope(),
      content: mailer.content(),
      data: mailer.getData() as Record<string, unknown>,
    };

    const job = await this.queue.add('mail.send', payload);
    this.logger.debug(
      `Email job ${job.id} enqueued → ${payload.envelope.toEmail}`,
    );
  }
}

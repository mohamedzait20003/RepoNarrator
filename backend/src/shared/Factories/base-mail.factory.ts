import { Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

/** Payload shape shared with the mail worker (duplicated to keep src/ ↔ workers/ independent). */
export interface EmailJobPayload {
  to: { email: string; name: string };
  subject: string;
  /** Body template name in workers/mail/templates/ (without .hbs extension). */
  view: string;
  data: Record<string, unknown>;
}

/**
 * Abstract base for all module-level mail factories.
 *
 * Handles queue lifecycle (setup + graceful shutdown). Subclasses call
 * `this.enqueue(payload)` from domain-specific send methods.
 */
export abstract class BaseMailFactory implements OnApplicationShutdown {
  private readonly logger = new Logger(this.constructor.name);
  private readonly queue: Queue<EmailJobPayload>;
  private readonly connection: Redis;

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>('redis.url')!;

    this.connection = new Redis(redisUrl, {
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

  protected async enqueue(payload: EmailJobPayload): Promise<void> {
    const job = await this.queue.add('mail.send', payload);
    this.logger.debug(`Email job ${job.id} enqueued → ${payload.to.email}`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.queue.close();
    await this.connection.quit();
  }
}

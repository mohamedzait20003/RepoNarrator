import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';

/** Payload consumed by the narration worker (kept minimal — it reloads state by id). */
export interface NarrationJob {
  generationId: string;
}

export const NARRATION_QUEUE = 'narration';

/**
 * Producer for the narration queue. Mirrors the mail factory's lifecycle: owns
 * a BullMQ queue on the shared Redis connection and closes it on shutdown.
 */
@Injectable()
export class NarrationQueue implements OnApplicationShutdown {
  private readonly logger = new Logger(NarrationQueue.name);
  private readonly queue: Queue<NarrationJob>;
  private readonly connection: Redis;

  constructor(config: ConfigService) {
    const redisUrl = config.get<string>('redis.url')!;

    this.connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.queue = new Queue<NarrationJob>(NARRATION_QUEUE, {
      connection: this.connection,
      defaultJobOptions: {
        // No auto-retry: quota is reserved on enqueue, so a retry would
        // double-count. The runner refunds on failure instead.
        attempts: 1,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 100 },
      },
    });
  }

  async enqueue(job: NarrationJob): Promise<void> {
    const added = await this.queue.add('narration.generate', job);
    this.logger.debug(
      `Narration job ${added.id} enqueued → ${job.generationId}`,
    );
  }

  async onApplicationShutdown(): Promise<void> {
    await this.queue.close();
    await this.connection.quit();
  }
}

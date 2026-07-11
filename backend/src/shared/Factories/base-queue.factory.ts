import { Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsOptions, Queue } from 'bullmq';
import { Redis } from 'ioredis';

/**
 * Generic BullMQ producer. Owns a Redis connection + queue and closes both on
 * application shutdown. A subclass passes its queue name + job name (and
 * optional job options) to `super()`, then calls `this.enqueue(payload)` from
 * its own domain methods.
 *
 * `TPayload` types the public `enqueue` contract; the underlying queue stays
 * loosely typed so bullmq's name-inference doesn't fight the generic.
 */
export abstract class BaseQueueFactory<
  TPayload,
> implements OnApplicationShutdown {
  private readonly logger = new Logger(this.constructor.name);
  private readonly connection: Redis;
  private readonly producer: Queue;
  private readonly jobName: string;

  protected constructor(
    config: ConfigService,
    queueName: string,
    jobName: string,
    jobOptions?: JobsOptions,
  ) {
    this.jobName = jobName;
    this.connection = new Redis(config.get<string>('redis.url')!, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
    this.producer = new Queue(queueName, {
      connection: this.connection,
      defaultJobOptions: jobOptions ?? {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2_000 },
        removeOnComplete: { count: 200 },
        removeOnFail: { count: 100 },
      },
    });
  }

  protected async enqueue(payload: TPayload): Promise<void> {
    const job = await this.producer.add(this.jobName, payload);
    this.logger.debug(`Job ${job.id ?? '?'} enqueued`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer.close();
    await this.connection.quit();
  }
}

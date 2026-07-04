import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';
import { WorkerModule } from './worker.module';
import { MailService } from '../src/shared/Services/mail.service';
import type { Envelope } from '../src/shared/Mail/envelope';
import type { MailContent } from '../src/shared/Mail/mail-content';

export interface EmailJobPayload {
  envelope: Envelope;
  content: MailContent;
  data: Record<string, unknown>;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule, {
    logger: ['log', 'warn', 'error'],
  });

  const mailService = app.get(MailService);

  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';

  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  });

  const concurrency = parseInt(process.env.MAIL_WORKER_CONCURRENCY ?? '5', 10);

  const worker = new Worker<EmailJobPayload>(
    'email',
    async (job: Job<EmailJobPayload>) => {
      const { envelope, content, data } = job.data;
      await mailService.sendRaw(envelope, content, data);
    },
    {
      connection,
      concurrency,
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 100 },
    },
  );

  worker.on('completed', (job) =>
    console.log(
      `[email-worker] Job ${job.id} completed — ${job.data.envelope.toEmail}`,
    ),
  );

  worker.on('failed', (job, err) =>
    console.error(
      `[email-worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`,
      err.message,
    ),
  );

  console.log(
    `[email-worker] Started — concurrency: ${concurrency}, queue: email`,
  );

  const shutdown = async () => {
    await worker.close();
    await connection.quit();
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

void bootstrap();

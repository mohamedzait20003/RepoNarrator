import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Worker, type Job } from 'bullmq';
import IORedis from 'ioredis';

import { MailWorkerModule } from './mail.module';
import { RendererService } from './services/renderer.service';
import { SenderService } from './services/sender.service';
import type { EmailJobPayload } from './types';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(MailWorkerModule, {
    logger: ['log', 'warn', 'error'],
  });

  const renderer = app.get(RendererService);
  const sender = app.get(SenderService);

  const connection = new IORedis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
    { maxRetriesPerRequest: null, enableReadyCheck: false },
  );

  const concurrency = parseInt(process.env.MAIL_WORKER_CONCURRENCY ?? '5', 10);

  const worker = new Worker<EmailJobPayload>(
    'email',
    async (job: Job<EmailJobPayload>) => {
      const { envelope, content, data } = job.data;
      const html = renderer.render(content.view, data, content.template);
      await sender.send(envelope, html);
    },
    {
      connection,
      concurrency,
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 100 },
    },
  );

  worker.on('completed', (job) =>
    console.log(`[mail-worker] ✓ ${job.id} → ${job.data.envelope.toEmail}`),
  );

  worker.on('failed', (job, err) =>
    console.error(
      `[mail-worker] ✗ ${job?.id} (attempt ${job?.attemptsMade}): ${err.message}`,
    ),
  );

  console.log(`[mail-worker] Ready — concurrency: ${concurrency}`);

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

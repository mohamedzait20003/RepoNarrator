import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Worker, type Job } from 'bullmq';
import { Redis, type RedisOptions } from 'ioredis';

import {
  NARRATION_QUEUE,
  type NarrationJob,
} from '@/modules/generations/factories/narration.factory';
import { WorkersModule } from './workers.module';
import { RendererService } from './mail/services/renderer.service';
import { SenderService } from './mail/services/sender.service';
import { NarrationRunner } from './narration/services/narration-runner.service';
import type { EmailJobPayload } from './mail/types';

const REDIS_OPTS: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

const intEnv = (name: string, fallback: number): number =>
  parseInt(process.env[name] ?? String(fallback), 10);

/** Boots one Nest context and starts every background worker (mail + narration). */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkersModule, {
    logger: ['log', 'warn', 'error'],
  });

  const renderer = app.get(RendererService);
  const sender = app.get(SenderService);
  const runner = app.get(NarrationRunner);

  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  // Each worker gets its own connection (bullmq uses blocking commands).
  const mailConnection = new Redis(redisUrl, REDIS_OPTS);
  const narrationConnection = new Redis(redisUrl, REDIS_OPTS);

  const mailWorker = new Worker<EmailJobPayload>(
    'email',
    async (job: Job<EmailJobPayload>) => {
      const html = renderer.render(job.data.view, job.data.data);
      await sender.send(job.data, html);
    },
    {
      connection: mailConnection,
      concurrency: intEnv('MAIL_WORKER_CONCURRENCY', 5),
      removeOnComplete: { count: 200 },
      removeOnFail: { count: 100 },
    },
  );

  const narrationWorker = new Worker<NarrationJob>(
    NARRATION_QUEUE,
    async (job: Job<NarrationJob>) => {
      await runner.run(job.data.generationId);
    },
    {
      connection: narrationConnection,
      concurrency: intEnv('NARRATION_WORKER_CONCURRENCY', 2),
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    },
  );

  mailWorker.on('failed', (job, err) =>
    console.error(`[workers:mail] ✗ ${job?.id}: ${err.message}`),
  );
  narrationWorker.on('failed', (job, err) =>
    console.error(`[workers:narration] ✗ ${job?.id}: ${err.message}`),
  );

  console.log('[workers] Ready — mail + narration');

  const shutdown = async () => {
    await Promise.all([mailWorker.close(), narrationWorker.close()]);
    await Promise.all([mailConnection.quit(), narrationConnection.quit()]);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

void bootstrap();

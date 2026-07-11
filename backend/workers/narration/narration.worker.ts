import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';

import {
  NARRATION_QUEUE,
  type NarrationJob,
} from '@/modules/generations/factories/narration.factory';
import { NarrationWorkerModule } from './narration.module';
import { NarrationRunner } from './services/narration-runner.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(
    NarrationWorkerModule,
    { logger: ['log', 'warn', 'error'] },
  );

  const runner = app.get(NarrationRunner);

  const connection = new Redis(
    process.env.REDIS_URL ?? 'redis://localhost:6379',
    { maxRetriesPerRequest: null, enableReadyCheck: false },
  );

  const concurrency = parseInt(
    process.env.NARRATION_WORKER_CONCURRENCY ?? '2',
    10,
  );

  const worker = new Worker<NarrationJob>(
    NARRATION_QUEUE,
    async (job: Job<NarrationJob>) => {
      await runner.run(job.data.generationId);
    },
    {
      connection,
      concurrency,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    },
  );

  worker.on('completed', (job) =>
    console.log(`[narration-worker] ✓ ${job.id} → ${job.data.generationId}`),
  );
  worker.on('failed', (job, err) =>
    console.error(`[narration-worker] ✗ ${job?.id}: ${err.message}`),
  );

  console.log(`[narration-worker] Ready — concurrency: ${concurrency}`);

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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { BaseQueueFactory } from '@/shared/Factories/base-queue.factory';

export interface NarrationJob {
  generationId: string;
}

export const NARRATION_QUEUE = 'narration';

@Injectable()
export class NarrationFactory extends BaseQueueFactory<NarrationJob> {
  constructor(config: ConfigService) {
    super(config, NARRATION_QUEUE, 'narration.generate', {
      attempts: 1,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    });
  }

  async queue(generationId: string): Promise<void> {
    await this.enqueue({ generationId });
  }
}

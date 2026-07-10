import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Generation } from '@/modules/generations/entities/generation.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { GenerationStatus } from '@/shared/Domain/enums/generation-status.enum';

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Phase 1 skeleton: walks a narration through its phases and writes a stub
 * README, proving the enqueue → worker → poll loop end-to-end. Phase 3 replaces
 * `produce()` with the LangGraph agent (résumé + repos → Gemini draft).
 */
@Injectable()
export class NarrationRunner {
  private readonly logger = new Logger(NarrationRunner.name);

  constructor(
    @InjectRepository(Generation)
    private readonly generations: Repository<Generation>,
    @InjectRepository(UsageCounter)
    private readonly usage: Repository<UsageCounter>,
  ) {}

  async run(generationId: string): Promise<void> {
    const gen = await this.generations.findOne({
      where: { id: generationId },
    });
    if (!gen) {
      this.logger.warn(`Generation ${generationId} not found — skipping.`);
      return;
    }

    try {
      await this.advance(gen, 'gathering');
      await sleep(400);
      await this.advance(gen, 'analyzing');
      await sleep(400);
      await this.advance(gen, 'drafting');
      await sleep(400);

      gen.generatedMd = this.produce(gen);
      gen.status = GenerationStatus.COMPLETED;
      gen.phase = 'completed';
      gen.completedAt = new Date();
      await this.generations.save(gen);
      this.logger.log(`Narration ${gen.id} completed (stub).`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      gen.status = GenerationStatus.FAILED;
      gen.phase = 'failed';
      gen.error = message;
      await this.generations.save(gen);
      await this.refund(gen);
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private async advance(gen: Generation, phase: string): Promise<void> {
    gen.status = GenerationStatus.RUNNING;
    gen.phase = phase;
    await this.generations.save(gen);
  }

  /** Give back the reserved profile-narration when a run fails. */
  private async refund(gen: Generation): Promise<void> {
    const periodStart = this.periodOf(gen.createdAt);
    const row = await this.usage.findOne({
      where: { userId: gen.userId, periodStart },
    });
    if (row && row.profileNarrationsUsed > 0) {
      row.profileNarrationsUsed -= 1;
      await this.usage.save(row);
    }
  }

  private periodOf(date: Date): string {
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${date.getUTCFullYear()}-${month}-01`;
  }

  private produce(gen: Generation): string {
    const lines = [
      '# 👋 Profile README',
      '',
      '_Placeholder from the Narrate Yourself pipeline — Phase 1 skeleton. The',
      'agentic Gemini flow (résumé + repos → draft) lands in Phase 3._',
      '',
    ];
    if (gen.intent) lines.push(`> Steering note: ${gen.intent}`, '');
    lines.push(
      `Generated ${new Date().toISOString()} using ${gen.model ?? 'the default model'}.`,
    );
    return lines.join('\n');
  }
}

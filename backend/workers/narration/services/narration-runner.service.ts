import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Generation } from '@/modules/generations/entities/generation.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { GenerationStatus } from '@/shared/Domain/enums/generation-status.enum';
import { NarrationContextService } from '../context/narration-context.service';
import { NarrationAgentService } from '../agent/narration-agent.service';

/**
 * Runs a "Narrate Yourself" job: gathers the user's context (résumé + profile
 * README + repos), then hands it to the LangGraph + Gemini agent to write the
 * profile README. Progress is streamed to the `phase` column for polling.
 */
@Injectable()
export class NarrationRunner {
  private readonly logger = new Logger(NarrationRunner.name);

  constructor(
    @InjectRepository(Generation)
    private readonly generations: Repository<Generation>,
    @InjectRepository(UsageCounter)
    private readonly usage: Repository<UsageCounter>,
    private readonly context: NarrationContextService,
    private readonly agent: NarrationAgentService,
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
      const context = await this.context.gather(gen.userId);

      const provider = gen.provider;
      const modelId = gen.model;
      if (!provider || !modelId) {
        throw new Error('Narration has no model assigned.');
      }

      const result = await this.agent.run({
        context,
        intent: gen.intent,
        provider,
        modelId,
        onPhase: (phase) => this.advance(gen, phase),
      });

      if (!result.markdown) {
        throw new Error('The model returned an empty README.');
      }

      gen.generatedMd = result.markdown;
      gen.inputTokens = result.inputTokens;
      gen.outputTokens = result.outputTokens;
      gen.status = GenerationStatus.COMPLETED;
      gen.phase = 'completed';
      gen.completedAt = new Date();
      await this.generations.save(gen);
      this.logger.log(
        `Narration ${gen.id} completed — ${context.repos.length} repos, ${result.outputTokens} output tokens.`,
      );
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
}

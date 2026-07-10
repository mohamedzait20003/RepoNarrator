import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Generation } from '@/modules/generations/entities/generation.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { GenerationStatus } from '@/shared/Domain/enums/generation-status.enum';
import { NarrationContextService } from '../context/narration-context.service';
import type { NarrationContext } from '../context/narration-context.types';

/**
 * Phase 2: gathers the real narration context (résumé + profile README + repos)
 * and reports it in the output, proving the pipeline reads live data. Phase 3
 * replaces `produce()` with the LangGraph + Gemini agent that consumes it.
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

      await this.advance(gen, 'analyzing');
      await this.advance(gen, 'drafting');

      gen.generatedMd = this.produce(gen, context);
      gen.status = GenerationStatus.COMPLETED;
      gen.phase = 'completed';
      gen.completedAt = new Date();
      await this.generations.save(gen);
      this.logger.log(
        `Narration ${gen.id} completed — ${context.repos.length} repos, résumé ${
          context.resumeText ? 'yes' : 'no'
        }.`,
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

  private produce(gen: Generation, context: NarrationContext): string {
    const lines = [
      '# 👋 Profile README',
      '',
      '_Placeholder from the Narrate Yourself pipeline — Phase 2. Context is now',
      'gathered from your résumé + GitHub; the Gemini agent that writes from it',
      'lands in Phase 3._',
      '',
    ];
    if (gen.intent) lines.push(`> Steering note: ${gen.intent}`, '');
    lines.push(
      '## Context gathered',
      `- GitHub: ${
        context.githubConnected ? `@${context.githubLogin}` : 'not connected'
      }`,
      `- Résumé: ${context.resumeText ? 'parsed' : 'none'}`,
      `- Profile README: ${context.profileReadme ? 'found' : 'none'}`,
      `- Project repos read: ${context.repos.length}`,
    );
    for (const r of context.repos) {
      lines.push(
        `  - **${r.fullName}** (${r.language ?? 'n/a'}, ★${r.stars})${
          r.readme ? ' — README ✓' : ''
        }`,
      );
    }
    lines.push(
      '',
      `Generated ${new Date().toISOString()} using ${gen.model ?? 'the default model'}.`,
    );
    return lines.join('\n');
  }
}

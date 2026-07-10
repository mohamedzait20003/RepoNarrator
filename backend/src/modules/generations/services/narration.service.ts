import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Generation } from '@/modules/generations/entities/generation.entity';
import { AiModel } from '@/modules/subscription/entities/ai-model.entity';
import { Subscription } from '@/modules/subscription/entities/subscription.entity';
import { Plan } from '@/modules/subscription/entities/plan.entity';
import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { GenerationKind } from '@/shared/Domain/enums/generation-kind.enum';
import { GenerationStatus } from '@/shared/Domain/enums/generation-status.enum';
import { PushMode } from '@/shared/Domain/enums/push-mode.enum';
import { ModelTier } from '@/shared/Domain/enums/model-tier.enum';
import { PlanTier } from '@/shared/Domain/enums/plan-tier.enum';
import { NarrationQueue } from '@/modules/generations/queue/narration.queue';
import type { StartNarrationDto } from '@/modules/generations/dto/start-narration.dto';
import type {
  NarrationStartView,
  NarrationView,
} from '@/modules/generations/dto/narration.dto';

/** Model access order — a user may use any model at or below their plan's tier. */
const TIER_RANK: Record<ModelTier, number> = {
  [ModelTier.ECONOMY]: 0,
  [ModelTier.STANDARD]: 1,
  [ModelTier.PREMIUM]: 2,
};

/**
 * "Narrate Yourself" orchestration (Phase 1: enqueue + status). Enforces the
 * per-plan profile-narration quota, resolves the AI model from the catalog
 * (user pick → plan default, tier-gated), records the run, and queues the job.
 */
@Injectable()
export class NarrationService {
  constructor(
    @InjectRepository(Generation)
    private readonly generations: Repository<Generation>,
    @InjectRepository(AiModel) private readonly aiModels: Repository<AiModel>,
    @InjectRepository(Subscription)
    private readonly subscriptions: Repository<Subscription>,
    @InjectRepository(Plan) private readonly plans: Repository<Plan>,
    @InjectRepository(UsageCounter)
    private readonly usage: Repository<UsageCounter>,
    private readonly queue: NarrationQueue,
  ) {}

  async start(
    userId: string,
    dto: StartNarrationDto,
  ): Promise<NarrationStartView> {
    const plan = await this.loadPlan(userId);
    await this.reserveQuota(userId, plan);
    const model = await this.resolveModel(plan, dto.modelId);

    const generation = await this.generations.save(
      this.generations.create({
        userId,
        kind: GenerationKind.PROFILE,
        status: GenerationStatus.QUEUED,
        phase: 'queued',
        intent: dto.intent ?? null,
        aiModelId: model.id,
        provider: model.provider,
        model: model.modelId,
        pushMode: PushMode.DIRECT, // all tiers push direct to the default branch
      }),
    );

    await this.queue.enqueue({ generationId: generation.id });
    return { Id: generation.id };
  }

  async status(userId: string, id: string): Promise<NarrationView> {
    const gen = await this.generations.findOne({
      where: { id, userId, kind: GenerationKind.PROFILE },
    });
    if (!gen) throw new NotFoundException('Narration not found.');

    return {
      Id: gen.id,
      Status: gen.status,
      Phase: gen.phase,
      GeneratedMd: gen.generatedMd,
      Model: gen.model,
      Error: gen.error,
      CreatedAt: gen.createdAt.toISOString(),
    };
  }

  private async loadPlan(userId: string): Promise<Plan> {
    const subscription = await this.subscriptions.findOne({
      where: { userId },
    });
    const plan =
      (subscription?.plan as Plan | undefined) ??
      (await this.plans.findOne({ where: { tier: PlanTier.FREE } }));
    if (!plan) throw new BadRequestException('No plan is configured.');
    return plan;
  }

  /** Reserve one profile-narration against the plan cap for the current period. */
  private async reserveQuota(userId: string, plan: Plan): Promise<void> {
    const limit = plan.features.profileNarrations; // -1 = unlimited, 0 = none
    if (limit === 0) {
      throw new ForbiddenException(
        'Your plan does not include Narrate Yourself.',
      );
    }

    const periodStart = this.currentPeriodStart();
    const row =
      (await this.usage.findOne({ where: { userId, periodStart } })) ??
      this.usage.create({
        userId,
        periodStart,
        generationsUsed: 0,
        profileNarrationsUsed: 0,
      });

    if (limit !== -1 && row.profileNarrationsUsed >= limit) {
      throw new ForbiddenException(
        `You've used all ${limit} Narrate Yourself run${
          limit === 1 ? '' : 's'
        } for this period.`,
      );
    }

    row.profileNarrationsUsed += 1;
    await this.usage.save(row);
  }

  /** Selected model (tier-checked) or the plan's default from the catalog. */
  private async resolveModel(plan: Plan, modelId?: string): Promise<AiModel> {
    const rank = TIER_RANK[plan.modelTier];
    const allowed = (
      await this.aiModels.find({ where: { isEnabled: true } })
    ).filter((m) => TIER_RANK[m.tier] <= rank);

    if (allowed.length === 0) {
      throw new BadRequestException(
        'No AI model is available right now. Please try again later.',
      );
    }

    if (modelId) {
      const chosen = allowed.find((m) => m.id === modelId);
      if (!chosen) {
        throw new ForbiddenException(
          'That model is not available on your plan.',
        );
      }
      return chosen;
    }

    return allowed.find((m) => m.isDefault) ?? allowed[0];
  }

  /** First day of the current UTC month, as the usage period key (YYYY-MM-01). */
  private currentPeriodStart(): string {
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${now.getUTCFullYear()}-${month}-01`;
  }
}

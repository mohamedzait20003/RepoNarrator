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
import { GenerationKind } from '@/shared/Domain/enums/generation-kind.enum';
import { GenerationStatus } from '@/shared/Domain/enums/generation-status.enum';
import { PushMode } from '@/shared/Domain/enums/push-mode.enum';
import { ModelTier } from '@/shared/Domain/enums/model-tier.enum';
import { PlanTier } from '@/shared/Domain/enums/plan-tier.enum';
import { NarrationQuotaService } from '@/modules/generations/services/narration-quota.service';
import { GithubCommitService } from '@/modules/generations/services/github-commit.service';
import { NarrationFactory } from '@/modules/generations/factories/narration.factory';
import type { StartNarrationDto } from '@/modules/generations/dto/start-narration.dto';
import type {
  CommitView,
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
 * "Narrate Yourself" job lifecycle. Resolves the user's plan + model (catalog,
 * tier-gated), delegates quota to {@link NarrationQuotaService}, records the run
 * and enqueues it via {@link NarrationFactory}; also reports status for polling.
 */
@Injectable()
export class NarrationService {
  constructor(
    @InjectRepository(Generation)
    private readonly generations: Repository<Generation>,
    @InjectRepository(Subscription)
    private readonly subscriptions: Repository<Subscription>,
    @InjectRepository(Plan) private readonly plans: Repository<Plan>,
    @InjectRepository(AiModel) private readonly aiModels: Repository<AiModel>,
    private readonly quota: NarrationQuotaService,
    private readonly narrations: NarrationFactory,
    private readonly github: GithubCommitService,
  ) {}

  async start(
    userId: string,
    dto: StartNarrationDto,
  ): Promise<NarrationStartView> {
    const plan = await this.loadPlan(userId);
    await this.quota.reserve(userId, plan);
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

    await this.narrations.queue(generation.id);
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

  /** Push the (edited) README straight to the user's profile repo default branch. */
  async commit(
    userId: string,
    id: string,
    content: string,
  ): Promise<CommitView> {
    const gen = await this.generations.findOne({
      where: { id, userId, kind: GenerationKind.PROFILE },
    });
    if (!gen) throw new NotFoundException('Narration not found.');
    if (gen.status !== GenerationStatus.COMPLETED) {
      throw new BadRequestException('This narration is not ready to commit.');
    }

    const result = await this.github.commitProfileReadme(userId, content);

    gen.generatedMd = content; // persist the committed version
    gen.commitSha = result.commitSha;
    gen.pushMode = PushMode.DIRECT;
    await this.generations.save(gen);

    return { CommitSha: result.commitSha, HtmlUrl: result.htmlUrl };
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
}

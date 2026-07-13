import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AiModel } from '@/modules/subscription/entities/ai-model.entity';
import { PlanService } from '@/modules/subscription/services/plan.service';
import { ModelTier } from '@/shared/Domain/enums/model-tier.enum';
import type { AiModelView } from '@/modules/generations/dto/ai-model.dto';

const TIER_RANK: Record<ModelTier, number> = {
  [ModelTier.ECONOMY]: 0,
  [ModelTier.STANDARD]: 1,
  [ModelTier.PREMIUM]: 2,
};

/** The enabled models a user may pick — those at or below their plan's tier. */
@Injectable()
export class AiModelsService {
  constructor(
    @InjectRepository(AiModel) private readonly aiModels: Repository<AiModel>,
    private readonly plans: PlanService,
  ) {}

  async available(userId: string): Promise<AiModelView[]> {
    const plan = await this.plans.forUser(userId);
    const rank = TIER_RANK[plan.modelTier];

    return (
      await this.aiModels.find({
        where: { isEnabled: true },
        order: { tier: 'ASC', displayName: 'ASC' },
      })
    )
      .filter((m) => TIER_RANK[m.tier] <= rank)
      .map((m) => ({
        Id: m.id,
        Name: m.displayName,
        Description: m.description,
        Tier: m.tier,
        IsDefault: m.isDefault,
      }));
  }
}

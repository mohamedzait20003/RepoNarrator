import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { Plan } from '@/modules/subscription/entities/plan.entity';
import { PlanService } from '@/modules/subscription/services/plan.service';
import { QuotaKind } from '@/shared/Domain/enums/quota-kind.enum';

type UsageField = 'profileNarrationsUsed' | 'generationsUsed';

const METRICS: Record<
  QuotaKind,
  { label: string; field: UsageField; limit: (plan: Plan) => number }
> = {
  [QuotaKind.PROFILE_NARRATION]: {
    label: 'Narrate Yourself',
    field: 'profileNarrationsUsed',
    limit: (plan) => plan.features.profileNarrations,
  },
  [QuotaKind.REPO_GENERATION]: {
    label: 'README generation',
    field: 'generationsUsed',
    limit: (plan) => plan.generationLimit,
  },
};

/** Reserves a metered action against the user's per-plan, per-period quota. */
@Injectable()
export class QuotaService {
  constructor(
    @InjectRepository(UsageCounter)
    private readonly usage: Repository<UsageCounter>,
    private readonly plans: PlanService,
  ) {}

  /** Reserve one unit of `kind` (-1 = unlimited, 0 = not included). Throws 403 if over. */
  async reserve(userId: string, kind: QuotaKind): Promise<void> {
    const metric = METRICS[kind];
    const plan = await this.plans.forUser(userId);
    const limit = metric.limit(plan);

    if (limit === 0) {
      throw new ForbiddenException(
        `Your plan does not include ${metric.label}.`,
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

    if (limit !== -1 && row[metric.field] >= limit) {
      throw new ForbiddenException(
        `You've used all ${limit} ${metric.label} run${
          limit === 1 ? '' : 's'
        } for this period.`,
      );
    }

    row[metric.field] += 1;
    await this.usage.save(row);
  }

  /** First day of the current UTC month, as the usage period key (YYYY-MM-01). */
  private currentPeriodStart(): string {
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${now.getUTCFullYear()}-${month}-01`;
  }
}

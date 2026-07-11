import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsageCounter } from '@/modules/subscription/entities/usage-counter.entity';
import { Plan } from '@/modules/subscription/entities/plan.entity';

/** Enforces the per-plan "Narrate Yourself" quota for the current billing period. */
@Injectable()
export class NarrationQuotaService {
  constructor(
    @InjectRepository(UsageCounter)
    private readonly usage: Repository<UsageCounter>,
  ) {}

  async reserve(userId: string, plan: Plan): Promise<void> {
    const limit = plan.features.profileNarrations;
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

  /** First day of the current UTC month, as the usage period key (YYYY-MM-01). */
  private currentPeriodStart(): string {
    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${now.getUTCFullYear()}-${month}-01`;
  }
}

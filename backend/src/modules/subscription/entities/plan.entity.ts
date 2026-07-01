import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ModelTier } from '../../../shared/Domain/enums/model-tier.enum';
import { PlanTier } from '../../../shared/Domain/enums/plan-tier.enum';
import type { PlanFeatures } from '../../../shared/Domain/interfaces/plan-features.interface';

/** Subscription plan definition. Tunable via DB without a redeploy. */
@Entity({ name: 'plans' })
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PlanTier, unique: true })
  tier: PlanTier;

  /** Price in cents. */
  @Column({ type: 'int', name: 'price_monthly', default: 0 })
  priceMonthly: number;

  /** -1 = unlimited. */
  @Column({ type: 'int', name: 'repo_limit', default: 3 })
  repoLimit: number;

  /** Max generations per billing period. -1 = unlimited. */
  @Column({ type: 'int', name: 'generation_limit', default: 5 })
  generationLimit: number;

  @Column({
    type: 'enum',
    enum: ModelTier,
    name: 'model_tier',
    default: ModelTier.ECONOMY,
  })
  modelTier: ModelTier;

  /**
   * Concrete provider model id resolved by LlmProviderFactory (Commit 5).
   * Example: "claude-haiku-4-5-20251001" or "gpt-4o-mini".
   */
  @Column({ type: 'text' })
  model: string;

  @Column({ type: 'jsonb' })
  features: PlanFeatures;

  @OneToMany('Subscription', 'plan')
  subscriptions: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

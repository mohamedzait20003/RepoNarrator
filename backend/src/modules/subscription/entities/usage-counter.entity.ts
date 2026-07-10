import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Tracks generation count per user per billing period (one row per period). */
@Index(['userId', 'periodStart'], { unique: true })
@Entity({ name: 'usage_counters' })
export class UsageCounter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne('UserProfile', 'usageCounters')
  @JoinColumn({ name: 'user_id' })
  profile: any;

  /** First day of the billing period (ISO date string, e.g. "2026-06-01"). */
  @Column({ type: 'date', name: 'period_start' })
  periodStart: string;

  /** Per-repo README generations used this period (vs `Plan.generationLimit`). */
  @Column({ type: 'int', name: 'generations_used', default: 0 })
  generationsUsed: number;

  /** "Narrate Yourself" runs used this period (vs `PlanFeatures.profileNarrations`). */
  @Column({ type: 'int', name: 'profile_narrations_used', default: 0 })
  profileNarrationsUsed: number;
}

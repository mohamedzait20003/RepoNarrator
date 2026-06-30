import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionStatus } from '../../../shared/Domain';

@Entity({ name: 'subscriptions' })
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @OneToOne('User', 'subscription')
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ type: 'uuid', name: 'plan_id' })
  planId: string;

  @ManyToOne('Plan', 'subscriptions', { eager: true })
  @JoinColumn({ name: 'plan_id' })
  plan: any;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIALING })
  status: SubscriptionStatus;

  @Column({ type: 'text', name: 'stripe_customer_id', nullable: true })
  stripeCustomerId: string | null;

  @Column({ type: 'text', name: 'stripe_subscription_id', nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ type: 'timestamptz', name: 'current_period_end', nullable: true })
  currentPeriodEnd: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

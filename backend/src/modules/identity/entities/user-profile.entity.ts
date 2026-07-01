import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Application-level profile for a user. Shares its primary key with the
 * `users` table (same UUID), keeping the FK column name `user_id` meaningful
 * in all child tables while cleanly separating auth identity from app data.
 */
@Entity({ name: 'user_profiles' })
export class UserProfile {
  /** Same UUID as the parent User row. */
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @OneToOne('User', 'profile')
  @JoinColumn({ name: 'id' })
  user: any;

  @OneToOne('Subscription', 'profile')
  subscription: any;

  @OneToMany('UsageCounter', 'profile')
  usageCounters: any[];

  @OneToMany('Resume', 'profile')
  resumes: any[];

  @OneToMany('Repo', 'profile')
  repos: any[];

  @OneToMany('Generation', 'profile')
  generations: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

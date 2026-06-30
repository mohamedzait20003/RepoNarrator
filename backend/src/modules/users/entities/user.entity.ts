import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'bigint', name: 'github_id' })
  githubId: string;

  @Column({ type: 'text', name: 'github_login' })
  githubLogin: string;

  @Index({ unique: true })
  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  name: string | null;

  @Column({ type: 'text', name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  /** GitHub access token, AES-256 encrypted at rest. */
  @Column({ type: 'text', name: 'access_token_enc', nullable: true })
  accessTokenEnc: string | null;

  @OneToOne('Subscription', 'user')
  subscription: any;

  @OneToMany('UsageCounter', 'user')
  usageCounters: any[];

  @OneToMany('Resume', 'user')
  resumes: any[];

  @OneToMany('Repo', 'user')
  repos: any[];

  @OneToMany('Generation', 'user')
  generations: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

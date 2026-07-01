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
import { UserRole } from '../../../shared/Domain/enums/user-role.enum';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Null for admin-role users who sign up via email rather than GitHub OAuth. */
  @Index({ unique: true })
  @Column({ type: 'bigint', name: 'github_id', nullable: true })
  githubId: string | null;

  @Column({ type: 'text', name: 'github_login', nullable: true })
  githubLogin: string | null;

  @Index({ unique: true })
  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  name: string | null;

  @Column({ type: 'text', name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  /** GitHub access token, AES-256 encrypted at rest. Null for non-OAuth users. */
  @Column({ type: 'text', name: 'access_token_enc', nullable: true })
  accessTokenEnc: string | null;

  /** Bcrypt hash. Only set for email+password accounts (support / super_admin roles). */
  @Column({ type: 'text', name: 'password_hash', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

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

  @OneToMany('Token', 'user')
  tokens: any[];

  @OneToMany('Session', 'user')
  sessions: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

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

  /** Encrypted GitHub OAuth access token (AES-256). Null for non-OAuth users. */
  @Column({ type: 'text', name: 'github_oauth_token_enc', nullable: true })
  githubOauthTokenEnc: string | null;

  /** Bcrypt hash. Set only for email+password accounts (support / super_admin roles). */
  @Column({ type: 'text', name: 'password_hash', nullable: true })
  passwordHash: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  /** Set when the user's email is confirmed. Null = unverified. */
  @Column({ type: 'timestamptz', name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date | null;

  /** Application profile — holds subscription, resumes, repos, generations. */
  @OneToOne('UserProfile', 'user')
  profile: any;

  @OneToMany('Token', 'user')
  tokens: any[];

  @OneToMany('Session', 'user')
  sessions: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

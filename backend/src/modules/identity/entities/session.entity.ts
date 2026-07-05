import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'sessions' })
@Index(['userId', 'sit'], { unique: true })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne('User', 'sessions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  /**
   * session-issued-at: the unix-seconds timestamp embedded as `sit` in both JWTs.
   * Used as the stable session identifier across refreshes.
   */
  @Column({ type: 'integer', name: 'sit' })
  sit: number;

  /** Argon2id / SHA-256 hash of a session secret — unused for JWT sessions, kept nullable. */
  @Column({ type: 'text', name: 'secret_hash', nullable: true })
  secretHash: string | null;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @Column({
    type: 'timestamptz',
    name: 'last_active_at',
    default: () => 'now()',
  })
  lastActiveAt: Date;

  @Column({ type: 'text', name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'text', name: 'user_agent', nullable: true })
  userAgent: string | null;

  /** Set when explicitly invalidated (logout / admin revoke). */
  @Column({ type: 'timestamptz', name: 'revoked_at', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

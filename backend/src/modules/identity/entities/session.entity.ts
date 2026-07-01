import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * Stateful session record.
 * A cryptographically random secret is generated per session; only its hash is persisted.
 * The raw secret travels to the client (HttpOnly cookie) and is re-hashed on every
 * request to verify against this row, enabling server-side revocation.
 */
@Entity({ name: 'sessions' })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne('User', 'sessions', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  /** Argon2id hash of the randomly generated session secret. */
  @Column({ type: 'text', name: 'secret_hash' })
  secretHash: string;

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

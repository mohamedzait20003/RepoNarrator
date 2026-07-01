import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TokenType } from '../../../shared/Domain';

/**
 * Short-lived token for email verification and password reset.
 * Only the hash is stored; the raw value is sent once and never persisted.
 */
@Entity({ name: 'tokens' })
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne('User', 'tokens', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @Column({ type: 'enum', enum: TokenType })
  type: TokenType;

  /** Argon2id hash of the raw token delivered to the user. */
  @Column({ type: 'text', name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  /** Set once consumed. Expired or used tokens are pruned by a scheduled worker. */
  @Column({ type: 'timestamptz', name: 'used_at', nullable: true })
  usedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

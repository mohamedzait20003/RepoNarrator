import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** Immutable record of admin actions. Never updated or deleted. */
@Entity({ name: 'audit_logs' })
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'admin_id' })
  adminId: string;

  @ManyToOne('Admin', 'auditLogs')
  @JoinColumn({ name: 'admin_id' })
  admin: any;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text', name: 'target_type', nullable: true })
  targetType: string | null;

  @Column({ type: 'text', name: 'target_id', nullable: true })
  targetId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

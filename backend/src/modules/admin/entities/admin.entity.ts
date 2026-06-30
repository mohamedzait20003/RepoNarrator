import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdminRole } from '../../../shared/Domain';

/**
 * Admin account. Separate table from User.
 * Email constrained to @reponarratoradmin.com at both DB and service layer.
 */
@Check(`"email" LIKE '%@reponarratoradmin.com'`)
@Entity({ name: 'admins' })
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'text', nullable: true })
  name: string | null;

  @Column({ type: 'enum', enum: AdminRole, default: AdminRole.SUPPORT })
  role: AdminRole;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany('AuditLog', 'admin')
  auditLogs: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'updated_at', nullable: true })
  updatedAt: Date | null;
}

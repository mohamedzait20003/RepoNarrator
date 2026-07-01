import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResumeSource } from '../../../shared/Domain/enums/resume-source.enum';

@Entity({ name: 'resumes' })
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne('UserProfile', 'resumes')
  @JoinColumn({ name: 'user_id' })
  profile: any;

  @Column({ type: 'enum', enum: ResumeSource })
  source: ResumeSource;

  /** Storage key (for uploads) or external URL (for links). */
  @Column({ type: 'text', name: 'file_url' })
  fileUrl: string;

  /** Raw text extracted for LLM context window. */
  @Column({ type: 'text', name: 'parsed_text', nullable: true })
  parsedText: string | null;

  /** Structured extraction (skills, roles, summary) produced by LangChain (Commit 4). */
  @Column({ type: 'jsonb', name: 'parsed_json', nullable: true })
  parsedJson: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

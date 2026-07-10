import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { LlmProvider } from '@/shared/Domain/enums/llm-provider.enum';
import { ModelTier } from '@/shared/Domain/enums/model-tier.enum';

/**
 * An AI model the app can generate with — an admin-managed catalog (Admin
 * Dashboard). A user may pick any enabled model whose `tier` is within their
 * plan's `modelTier`; when none is chosen, the enabled `isDefault` model at
 * that tier is used. The LlmProviderFactory resolves `provider` + `modelId` to
 * a concrete LangChain chat model.
 */
@Unique(['provider', 'modelId'])
@Entity({ name: 'ai_models' })
export class AiModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LlmProvider })
  provider: LlmProvider;

  /** Provider model slug, e.g. "gemini-2.0-flash". */
  @Column({ type: 'text', name: 'model_id' })
  modelId: string;

  @Column({ type: 'text', name: 'display_name' })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Access tier — a user may use models at or below their plan's modelTier. */
  @Column({ type: 'enum', enum: ModelTier, default: ModelTier.ECONOMY })
  tier: ModelTier;

  @Column({ type: 'boolean', name: 'is_enabled', default: true })
  isEnabled: boolean;

  /** The fallback model for its tier when the user doesn't pick one. */
  @Column({ type: 'boolean', name: 'is_default', default: false })
  isDefault: boolean;

  @Column({ type: 'int', name: 'context_window', nullable: true })
  contextWindow: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

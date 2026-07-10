import { DataSource } from 'typeorm';
import { AiModel } from '@/modules/subscription/entities/ai-model.entity';
import { LlmProvider } from '@/shared/Domain/enums/llm-provider.enum';
import { ModelTier } from '@/shared/Domain/enums/model-tier.enum';

/**
 * Seeds the model catalog. Phase 1 ships a single free-tier Gemini model as the
 * economy default; more (and other providers) are added via the Admin Dashboard.
 */
export async function seedAiModels(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(AiModel);
  if ((await repo.count()) > 0) return;

  await repo.save([
    {
      provider: LlmProvider.GOOGLE,
      modelId: 'gemini-2.0-flash',
      displayName: 'Gemini 2.0 Flash',
      description: 'Google Gemini 2.0 Flash — fast, free-tier model.',
      tier: ModelTier.ECONOMY,
      isEnabled: true,
      isDefault: true,
      contextWindow: 1_048_576,
    },
  ]);

  console.log('AI models seeded.');
}

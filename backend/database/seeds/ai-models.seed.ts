import { DataSource } from 'typeorm';
import { AiModel } from '@/modules/subscription/entities/ai-model.entity';
import { LlmProvider } from '@/shared/Domain/enums/llm-provider.enum';
import { ModelTier } from '@/shared/Domain/enums/model-tier.enum';

/**
 * Seeds the model catalog with the current free-tier Gemini line-up. More models
 * (and other providers) are added/toggled via the Admin Dashboard.
 */
export async function seedAiModels(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(AiModel);
  if ((await repo.count()) > 0) return;

  await repo.save([
    {
      provider: LlmProvider.GOOGLE,
      modelId: 'gemini-3.1-flash-lite',
      displayName: 'Gemini 3.1 Flash Lite',
      description: 'Fast and lightweight — great for quick drafts.',
      tier: ModelTier.ECONOMY,
      isEnabled: true,
      isDefault: true,
      contextWindow: 1_048_576,
    },
    {
      provider: LlmProvider.GOOGLE,
      modelId: 'gemini-3-flash-preview',
      displayName: 'Gemini 3 Flash',
      description: 'Balanced speed and quality.',
      tier: ModelTier.ECONOMY,
      isEnabled: true,
      isDefault: false,
      contextWindow: 1_048_576,
    },
    {
      provider: LlmProvider.GOOGLE,
      modelId: 'gemini-3.5-flash',
      displayName: 'Gemini 3.5 Flash',
      description: 'The most capable Flash model — richest writing.',
      tier: ModelTier.STANDARD,
      isEnabled: true,
      isDefault: false,
      contextWindow: 1_048_576,
    },
  ]);

  console.log('AI models seeded (Gemini 3.x).');
}

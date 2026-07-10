import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

import { LlmProvider } from '@/shared/Domain/enums/llm-provider.enum';

/**
 * Resolves a catalog model (provider + slug) to a concrete LangChain chat model.
 * v1 implements Google (Gemini); Anthropic/OpenAI slot in as future `case`s.
 */
@Injectable()
export class LlmProviderFactory {
  constructor(private readonly config: ConfigService) {}

  forModel(provider: LlmProvider, modelId: string): BaseChatModel {
    switch (provider) {
      case LlmProvider.GOOGLE:
        return new ChatGoogleGenerativeAI({
          apiKey: this.config.get<string>('llm.googleApiKey'),
          model: modelId,
          temperature: 0.6,
          maxOutputTokens: 4096,
        });
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}

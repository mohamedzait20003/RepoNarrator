import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

import { LlmProvider } from '@/shared/Domain/enums/llm-provider.enum';

/** OpenAI's reasoning models (o-series, GPT-5) only accept the default
 * temperature and count output against `max_completion_tokens`. */
const OPENAI_REASONING = /^(o\d|gpt-5)/i;

/**
 * Resolves a catalog model (provider + slug) to a concrete LangChain chat model.
 * Implements Google (Gemini) and OpenAI; Anthropic slots in as a future `case`.
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
      case LlmProvider.OPENAI: {
        const reasoning = OPENAI_REASONING.test(modelId);
        return new ChatOpenAI({
          apiKey: this.config.get<string>('llm.openaiApiKey'),
          model: modelId,
          ...(reasoning ? {} : { temperature: 0.6 }),
          maxTokens: reasoning ? 8192 : 4096,
        });
      }
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }
}

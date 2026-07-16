import { Injectable } from '@nestjs/common';
import { Annotation, END, START, StateGraph } from '@langchain/langgraph';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from '@langchain/core/messages';

import { LlmProvider } from '@/shared/Domain/enums/llm-provider.enum';
import { LlmProviderFactory } from '@/shared/Factories/llm-provider.factory';
import {
  PLANNER_PROMPT,
  WRITER_PROMPT,
  REVIEWER_PROMPT,
  plannerInput,
  writerInput,
  reviewerInput,
} from '../context/agent.loader';
import type { NarrationContext } from '../context/narration-context';

const MAX_REVISIONS = 2;

export interface AgentInput {
  context: NarrationContext;
  intent: string | null;
  provider: LlmProvider;
  modelId: string;
  onPhase?: (phase: string) => Promise<void>;
}

export interface AgentResult {
  markdown: string;
  inputTokens: number;
  outputTokens: number;
}

/** LangGraph state for the narration flow. */
const NarrationState = Annotation.Root({
  context: Annotation<NarrationContext>(),
  intent: Annotation<string | null>(),
  plan: Annotation<string>(),
  draft: Annotation<string>(),
  critique: Annotation<string>(),
  revisions: Annotation<number>(),
  approved: Annotation<boolean>(),
});

type NarrationStateType = typeof NarrationState.State;

/**
 * The "Narrate Yourself" agent: a LangGraph state machine that plans, drafts,
 * and self-critiques the profile README (bounded revise loop), running on the
 * provider/model resolved from the user's plan/selection.
 *
 *   analyze → draft → critique ──(revise, ≤MAX)──▶ draft
 *                          └──────(approve)───────▶ END
 */
@Injectable()
export class NarrationAgentService {
  constructor(private readonly factory: LlmProviderFactory) {}

  async run(input: AgentInput): Promise<AgentResult> {
    const model = this.factory.forModel(input.provider, input.modelId);
    const usage = { input: 0, output: 0 };

    const call = async (messages: BaseMessage[]): Promise<string> => {
      const res = await model.invoke(messages);
      usage.input += res.usage_metadata?.input_tokens ?? 0;
      usage.output += res.usage_metadata?.output_tokens ?? 0;
      return textOf(res);
    };

    const analyze = async (
      s: NarrationStateType,
    ): Promise<Partial<NarrationStateType>> => {
      await input.onPhase?.('analyzing');
      return {
        plan: await call([
          new SystemMessage(PLANNER_PROMPT),
          new HumanMessage(plannerInput(s.context, s.intent)),
        ]),
      };
    };

    const draft = async (
      s: NarrationStateType,
    ): Promise<Partial<NarrationStateType>> => {
      await input.onPhase?.('drafting');
      return {
        draft: await call([
          new SystemMessage(WRITER_PROMPT),
          new HumanMessage(
            writerInput(s.context, s.intent, s.plan, s.critique),
          ),
        ]),
        revisions: s.revisions + 1,
      };
    };

    const critique = async (
      s: NarrationStateType,
    ): Promise<Partial<NarrationStateType>> => {
      await input.onPhase?.('reviewing');
      const text = await call([
        new SystemMessage(REVIEWER_PROMPT),
        new HumanMessage(reviewerInput(s.context, s.plan, s.draft)),
      ]);
      return { critique: text, approved: /\bAPPROVED\b/i.test(text) };
    };

    // Node names must differ from state channels (draft/critique) — LangGraph rule.
    const route = (s: NarrationStateType): 'write' | typeof END =>
      s.approved || s.revisions >= MAX_REVISIONS ? END : 'write';

    const graph = new StateGraph(NarrationState)
      .addNode('analyze', analyze)
      .addNode('write', draft)
      .addNode('review', critique)
      .addEdge(START, 'analyze')
      .addEdge('analyze', 'write')
      .addEdge('write', 'review')
      .addConditionalEdges('review', route)
      .compile();

    const final = await graph.invoke({
      context: input.context,
      intent: input.intent,
      plan: '',
      draft: '',
      critique: '',
      revisions: 0,
      approved: false,
    });

    return {
      markdown: (final.draft ?? '').trim(),
      inputTokens: usage.input,
      outputTokens: usage.output,
    };
  }
}

/** README text out of an AI message (Gemini returns a string; guard the union). */
function textOf(msg: AIMessage): string {
  const content = msg.content;
  if (typeof content === 'string') return content;
  return content
    .map((part) =>
      typeof part === 'string' ? part : 'text' in part ? part.text : '',
    )
    .join('');
}

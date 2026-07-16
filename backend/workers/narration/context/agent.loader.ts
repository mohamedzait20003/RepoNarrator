import { readFileSync } from 'fs';
import { join } from 'path';

import type { NarrationContext } from './narration-context';

/** Truncate a repo README when packing it into a synthesis prompt. */
const REPO_README_IN_PROMPT = 1_500;

/** The agent card tree (…/workers/narration/agent), a sibling of this file. The
 * worker runs from source, so `__dirname` resolves to the real tree and the
 * Markdown is read live. */
const AGENT_DIR = join(__dirname, '..', 'agent');

interface AgentCard {
  meta: Map<string, string[]>;
  body: string;
}

/**
 * Minimal front-matter parser: splits a leading `---` block from the body and
 * reads `key: value`, `key: [a, b]`, and `key:` + `- item` list forms. Kept
 * dependency-free on purpose — the cards only use simple scalar/list keys.
 */
function parse(md: string): AgentCard {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(md);
  if (!match) return { meta: new Map(), body: md.trim() };

  const meta = new Map<string, string[]>();
  let current: string[] | null = null;
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([\w-]+):\s*(.*)$/.exec(line);
    const item = /^\s*-\s*(.+)$/.exec(line);
    if (kv) {
      const value = kv[2].trim();
      let items: string[];
      if (value.startsWith('[')) {
        items = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (value) {
        items = [value];
      } else {
        items = [];
      }
      current = items;
      meta.set(kv[1], items);
    } else if (item && current) {
      current.push(item[1].trim());
    }
  }
  return { meta, body: match[2].trim() };
}

function readCard(rel: string): AgentCard {
  return parse(readFileSync(join(AGENT_DIR, rel), 'utf8'));
}

/** Compose an agent card's system prompt from its referenced knowledge + skills. */
function assemble(agentFile: string): string {
  const { meta, body } = readCard(`agents/${agentFile}`);
  const sections = [body];

  const knowledge = (meta.get('knowledge') ?? []).map(
    (id) => readCard(`knowledge/${id}.md`).body,
  );
  if (knowledge.length) sections.push('# Operating principles', ...knowledge);

  const skills = (meta.get('skills') ?? []).map(
    (id) => readCard(`skills/${id}.md`).body,
  );
  if (skills.length) sections.push('# Skills', ...skills);

  return sections.join('\n\n');
}

/** Role system prompts, assembled once at worker startup from the agent cards. */
export const PLANNER_PROMPT = assemble('planner.agent.md');
export const WRITER_PROMPT = assemble('writer.agent.md');
export const REVIEWER_PROMPT = assemble('reviewer.agent.md');

// --- Human-turn builders: pack the working context into each role's input. ---

export function plannerInput(
  context: NarrationContext,
  intent: string | null,
): string {
  return [intentLine(intent), contextBlock(context)]
    .filter(Boolean)
    .join('\n\n');
}

export function writerInput(
  context: NarrationContext,
  intent: string | null,
  plan: string,
  critique: string,
): string {
  const parts = [intentLine(intent), `# Plan\n${plan}`];
  if (critique && !/\bAPPROVED\b/i.test(critique)) {
    parts.push(`# Revision feedback\n${critique}`);
  }
  parts.push(contextBlock(context));
  return parts.filter(Boolean).join('\n\n');
}

export function reviewerInput(
  context: NarrationContext,
  plan: string,
  draft: string,
): string {
  return [
    `# Plan\n${plan}`,
    contextBlock(context),
    `# Draft README\n${draft}`,
  ].join('\n\n');
}

function intentLine(intent: string | null): string {
  return intent ? `User intent: ${intent}` : '';
}

function contextBlock(ctx: NarrationContext): string {
  const parts: string[] = [
    `GitHub: ${ctx.githubConnected ? `@${ctx.githubLogin}` : 'not connected'}`,
  ];

  parts.push(
    ctx.resumeText
      ? `\n## Résumé\n${ctx.resumeText}`
      : '\n## Résumé\n(none provided)',
  );

  parts.push(
    ctx.profileReadme
      ? `\n## Current profile README (preserve its embeds/badges verbatim)\n${ctx.profileReadme}`
      : '\n## Current profile README\n(none yet)',
  );

  if (ctx.repos.length) {
    parts.push('\n## Projects');
    for (const r of ctx.repos) {
      parts.push(
        `### ${r.fullName} (${r.language ?? 'n/a'}, ★${r.stars})\n${
          r.description ?? ''
        }\n${r.readme ? r.readme.slice(0, REPO_README_IN_PROMPT) : '(no README)'}`,
      );
    }
  } else {
    parts.push('\n## Projects\n(no public repositories found)');
  }

  return parts.join('\n');
}

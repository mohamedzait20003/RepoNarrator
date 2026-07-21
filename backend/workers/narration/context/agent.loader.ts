import { readFileSync } from 'fs';
import { join } from 'path';

import type { NarrationContext, RepoReadmeContext } from './narration-context';

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
export const RESUME_ANALYST_PROMPT = assemble('resume-analyst.agent.md');
export const REPO_ANALYST_PROMPT = assemble('repo-analyst.agent.md');
export const PLANNER_PROMPT = assemble('planner.agent.md');
export const WRITER_PROMPT = assemble('writer.agent.md');
export const REVIEWER_PROMPT = assemble('reviewer.agent.md');
export const REPO_WRITER_PROMPT = assemble('repo-writer.agent.md');
export const REPO_REVIEWER_PROMPT = assemble('repo-reviewer.agent.md');

// --- Human-turn builders: pack the working context into each role's input. ---

/** Input for the Résumé Analyst — the résumé only. */
export function resumeAnalystInput(context: NarrationContext): string {
  return resumeSection(context);
}

/** Input for the Repo Analyst — the GitHub data only (repos + profile README). */
export function repoAnalystInput(context: NarrationContext): string {
  return [
    githubLine(context),
    readmeSection(context),
    reposSection(context),
  ].join('\n\n');
}

export function plannerInput(
  context: NarrationContext,
  intent: string | null,
  resumeProfile: string,
  repoProfile: string,
): string {
  return [
    intentLine(intent),
    analysisBlock(resumeProfile, repoProfile),
    contextBlock(context),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function writerInput(
  context: NarrationContext,
  intent: string | null,
  plan: string,
  critique: string,
  resumeProfile: string,
  repoProfile: string,
): string {
  const parts = [intentLine(intent), `# Plan\n${plan}`];
  if (critique && !/\bAPPROVED\b/i.test(critique)) {
    parts.push(`# Revision feedback\n${critique}`);
  }
  parts.push(analysisBlock(resumeProfile, repoProfile));
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

function analysisBlock(resumeProfile: string, repoProfile: string): string {
  return [
    `# Résumé analysis\n${resumeProfile || '(none)'}`,
    `# Repository analysis\n${repoProfile || '(none)'}`,
  ].join('\n\n');
}

function githubLine(ctx: NarrationContext): string {
  return `GitHub: ${ctx.githubConnected ? `@${ctx.githubLogin}` : 'not connected'}`;
}

function resumeSection(ctx: NarrationContext): string {
  return ctx.resumeText
    ? `## Résumé\n${ctx.resumeText}`
    : '## Résumé\n(none provided)';
}

function readmeSection(ctx: NarrationContext): string {
  return ctx.profileReadme
    ? `## Current profile README\n${ctx.profileReadme}`
    : '## Current profile README\n(none yet)';
}

function reposSection(ctx: NarrationContext): string {
  if (!ctx.repos.length) return '## Projects\n(no public repositories found)';
  const parts = ['## Projects'];
  for (const r of ctx.repos) {
    parts.push(
      `### ${r.fullName} (${r.language ?? 'n/a'}, ★${r.stars})\n${
        r.description ?? ''
      }\n${r.readme ? r.readme.slice(0, REPO_README_IN_PROMPT) : '(no README)'}`,
    );
  }
  return parts.join('\n\n');
}

function statsSection(ctx: NarrationContext): string {
  return ctx.statsEmbeds
    ? `## GitHub Stats (canonical — reproduce this block verbatim; do NOT alter or invent these URLs)\n${ctx.statsEmbeds}`
    : '';
}

function contextBlock(ctx: NarrationContext): string {
  return [
    githubLine(ctx),
    resumeSection(ctx),
    readmeSection(ctx),
    reposSection(ctx),
    statsSection(ctx),
  ]
    .filter(Boolean)
    .join('\n\n');
}

// --- Repo-README builders: pack one repository's content into the agent input. ---

export function repoWriterInput(
  context: RepoReadmeContext,
  intent: string | null,
  critique: string,
): string {
  const parts = [intentLine(intent)];
  if (critique && !/\bAPPROVED\b/i.test(critique)) {
    parts.push(`# Revision feedback\n${critique}`);
  }
  parts.push(repoContextBlock(context));
  return parts.filter(Boolean).join('\n\n');
}

export function repoReviewerInput(
  context: RepoReadmeContext,
  draft: string,
): string {
  return [repoContextBlock(context), `# Draft README\n${draft}`].join('\n\n');
}

function repoContextBlock(ctx: RepoReadmeContext): string {
  const parts = [
    `# Repository: ${ctx.fullName}`,
    `Description: ${ctx.description ?? '(none)'}`,
    `Languages: ${ctx.languages.length ? ctx.languages.join(', ') : '(unknown)'}`,
    `\n## Top-level files\n${
      ctx.fileTree.length ? ctx.fileTree.join('\n') : '(none)'
    }`,
  ];
  if (ctx.manifest) parts.push(`\n## Primary manifest\n${ctx.manifest}`);
  parts.push(
    ctx.readme
      ? `\n## Current README\n${ctx.readme}`
      : '\n## Current README\n(none yet)',
  );
  return parts.join('\n');
}

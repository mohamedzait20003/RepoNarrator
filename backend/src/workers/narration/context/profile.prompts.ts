import { join } from 'path';

import { makeAgentLoader } from '@/workers/shared/agent/card-loader';
import type { NarrationContext } from './narration-context';

/** Truncate a repo README when packing it into a synthesis prompt. */
const REPO_README_IN_PROMPT = 1_500;

/** This agent's card tree (…/narration/agent) + the shared cross-agent tree. */
const AGENT_DIR = join(__dirname, '..', 'agent');
const SHARED_DIR = join(__dirname, '..', '..', 'shared', 'agent');
const assemble = makeAgentLoader(AGENT_DIR, SHARED_DIR);

/** Profile ("Narrate Yourself") role prompts, assembled once at worker startup. */
export const RESUME_ANALYST_PROMPT = assemble('resume-analyst.agent.md');
export const REPO_ANALYST_PROMPT = assemble('repo-analyst.agent.md');
export const PLANNER_PROMPT = assemble('planner.agent.md');
export const WRITER_PROMPT = assemble('writer.agent.md');
export const REVIEWER_PROMPT = assemble('reviewer.agent.md');

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

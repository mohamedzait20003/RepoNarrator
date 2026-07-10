import type { NarrationContext } from '../context/narration-context.types';

/** Truncate a repo README when packing it into a synthesis prompt. */
const REPO_README_IN_PROMPT = 1_500;

export const ANALYZE_SYSTEM = `You are an expert at crafting standout GitHub *profile* READMEs (the special <user>/<user> repo shown on a developer's profile). Given a developer's résumé, their current profile README, and their public projects, produce a concise PLAN for an improved profile README: which sections to include, what to emphasize, the tone, and which projects to feature. Honor the user's intent when given. Output a short bulleted plan only — not the README itself.`;

export const DRAFT_SYSTEM = `You are an expert technical writer. Write a polished GitHub profile README in GitHub-Flavored Markdown that follows the given plan and is grounded ONLY in the provided résumé and projects — never invent facts, titles, or metrics. Include a brief intro, key skills, and a few featured projects with links. Keep it authentic and concise. If revision feedback is provided, address it. Output ONLY the Markdown — no surrounding code fence, no preamble or sign-off.`;

export const CRITIQUE_SYSTEM = `You review GitHub profile READMEs. Judge the draft against the plan for factual faithfulness to the source, completeness, tone, and Markdown formatting. If it is genuinely high quality and does not invent anything, reply with exactly "APPROVED". Otherwise reply with a short list of concrete, actionable fixes (do not rewrite it yourself).`;

export function analyzeHuman(
  context: NarrationContext,
  intent: string | null,
): string {
  return [intentLine(intent), contextBlock(context)]
    .filter(Boolean)
    .join('\n\n');
}

export function draftHuman(
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

export function critiqueHuman(plan: string, draft: string): string {
  return `# Plan\n${plan}\n\n# Draft README\n${draft}`;
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

  if (ctx.profileReadme) {
    parts.push(`\n## Current profile README\n${ctx.profileReadme}`);
  }

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

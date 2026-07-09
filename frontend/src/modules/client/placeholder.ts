/**
 * Placeholder view-models + sample data for the client dashboard.
 *
 * The backend currently exposes only the identity/auth surface, so repos,
 * generations, and usage aren't available from the API yet. These shapes and
 * fixtures let the dashboard render its populated state; swap them for real
 * query data (repos sync, generations, usage-counter) as those endpoints land.
 */

export type GenerationStatus = "completed" | "running" | "queued" | "failed";
export type PushMode = "manual" | "pr" | "direct";

export interface DashRepo {
  id: string;
  fullName: string;
  isPrivate: boolean;
  defaultBranch: string;
  language: string | null;
  stars: number;
  lastAnalyzedAt: string | null;
}

export interface DashGeneration {
  id: string;
  repo: string;
  status: GenerationStatus;
  model: string;
  pushMode: PushMode;
  prUrl: string | null;
  createdAt: string;
}

export interface DashUsage {
  /** -1 denotes unlimited. */
  generationsUsed: number;
  generationLimit: number;
  reposAnalyzed: number;
  repoLimit: number;
  periodEnd: string;
}

export interface DashPlan {
  tier: "free" | "starter" | "pro";
  name: string;
  priceMonthly: number;
  status: "active" | "trialing" | "past_due" | "canceled";
}

export const placeholderPlan: DashPlan = {
  tier: "free",
  name: "Free",
  priceMonthly: 0,
  status: "active",
};

export const placeholderUsage: DashUsage = {
  generationsUsed: 3,
  generationLimit: 5,
  reposAnalyzed: 2,
  repoLimit: 3,
  periodEnd: "2026-08-01",
};

export const placeholderRepos: DashRepo[] = [
  {
    id: "r0",
    fullName: "octocat/octocat",
    isPrivate: false,
    defaultBranch: "main",
    language: "Markdown",
    stars: 512,
    lastAnalyzedAt: null,
  },
  {
    id: "r1",
    fullName: "octocat/hello-world",
    isPrivate: false,
    defaultBranch: "main",
    language: "TypeScript",
    stars: 128,
    lastAnalyzedAt: "2026-07-04T10:20:00Z",
  },
  {
    id: "r2",
    fullName: "octocat/data-pipeline",
    isPrivate: true,
    defaultBranch: "develop",
    language: "Python",
    stars: 42,
    lastAnalyzedAt: null,
  },
  {
    id: "r3",
    fullName: "octocat/portfolio-site",
    isPrivate: false,
    defaultBranch: "main",
    language: "Astro",
    stars: 9,
    lastAnalyzedAt: "2026-06-28T14:03:00Z",
  },
];

export const placeholderGenerations: DashGeneration[] = [
  {
    id: "g1",
    repo: "octocat/hello-world",
    status: "completed",
    model: "claude-sonnet-4-6",
    pushMode: "pr",
    prUrl: "https://github.com/octocat/hello-world/pull/12",
    createdAt: "2026-07-04T10:22:00Z",
  },
  {
    id: "g2",
    repo: "octocat/portfolio-site",
    status: "completed",
    model: "claude-haiku-4-5",
    pushMode: "manual",
    prUrl: null,
    createdAt: "2026-06-28T14:05:00Z",
  },
  {
    id: "g3",
    repo: "octocat/data-pipeline",
    status: "failed",
    model: "claude-sonnet-4-6",
    pushMode: "pr",
    prUrl: null,
    createdAt: "2026-06-27T09:41:00Z",
  },
];

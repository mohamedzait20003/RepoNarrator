/**
 * Placeholder generation fixtures for the Projects page. Repos, plan, and usage
 * now come from real endpoints (/repos, /analytics/dashboard); generations still
 * use these fixtures until the generation engine + its endpoint land.
 */

export type GenerationStatus = "completed" | "running" | "queued" | "failed";
export type PushMode = "manual" | "pr" | "direct";

export interface DashGeneration {
  id: string;
  repo: string;
  status: GenerationStatus;
  model: string;
  pushMode: PushMode;
  prUrl: string | null;
  createdAt: string;
}

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

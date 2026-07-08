import type { ApiResponse } from "./baseModel";

/** Response shapes for GET /analytics/dashboard (mirrors the backend DTO). */

export interface DashboardPlan {
  Tier: string;
  Name: string;
  Status: string;
}

export interface DashboardUsage {
  GenerationsUsed: number;
  /** -1 = unlimited. */
  GenerationLimit: number;
  ReposAnalyzed: number;
  /** -1 = unlimited. */
  RepoLimit: number;
  PeriodEnd: string | null;
}

export interface DashboardGeneration {
  Id: string;
  Repo: string;
  Status: string;
  Model: string | null;
  PushMode: string;
  PrUrl: string | null;
  CreatedAt: string;
}

export interface DashboardData {
  GithubLinked: boolean;
  Plan: DashboardPlan;
  Usage: DashboardUsage;
  RecentGenerations: DashboardGeneration[];
}

export type DashboardResponse = ApiResponse<DashboardData>;

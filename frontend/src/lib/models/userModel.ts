export type Role = "user" | "support" | "super_admin";

export interface PlanFeatures {
  privateRepos: boolean;
  bulkGenerate: boolean;
  directPush: boolean;
  watermark: boolean;
  /** 0 = none, -1 = unlimited */
  customTemplates: number;
  /** -1 = unlimited */
  historyRetentionDays: number;
  apiAccess: boolean;
}

export interface Plan {
  id: string;
  tier: "free" | "starter" | "pro";
  priceMonthly: number;
  /** -1 = unlimited */
  repoLimit: number;
  /** -1 = unlimited */
  generationLimit: number;
  modelTier: "economy" | "standard" | "premium";
  features: PlanFeatures;
}

export interface Subscription {
  id: string;
  status: "active" | "past_due" | "canceled" | "trialing";
  currentPeriodEnd: string | null;
  plan: Plan;
}

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  githubLogin: string | null;
  role: Role;
  subscription: Subscription | null;
}

// Requests

// Responses

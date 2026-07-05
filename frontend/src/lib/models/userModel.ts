import type { BaseRequest, ApiResponse } from "./baseModel";

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
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  githubLogin: string | null;
  subscription: Subscription | null;
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface SignUpRequest extends BaseRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SignInRequest extends BaseRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest extends BaseRequest {
  email: string;
}

export interface ResetPasswordRequest extends BaseRequest {
  token: string;
  password: string;
}

export interface EmailVerifyRequest extends BaseRequest {
  token: string;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export interface AuthProfile {
  Email: string | null;
  Name: string | null;
  AvatarUrl: string | null;
}

export interface AuthResponseData {
  AccessToken: string;
  Role: Role;
  Profile: AuthProfile;
}

export interface RefreshResponseData {
  AccessToken: string;
}

export type AuthResponse = ApiResponse<AuthResponseData>;
export type RefreshResponse = ApiResponse<RefreshResponseData>;

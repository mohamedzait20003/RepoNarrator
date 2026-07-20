/** Abstract capability tier. Resolved to a concrete provider model at runtime. */
export enum ModelTier {
  ECONOMY = 'economy',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

/** Access order — a user may use any model at or below their plan's tier. */
export const MODEL_TIER_RANK: Record<ModelTier, number> = {
  [ModelTier.ECONOMY]: 0,
  [ModelTier.STANDARD]: 1,
  [ModelTier.PREMIUM]: 2,
};

/** True when `modelTier` is within (at or below) the plan's `planTier`. */
export function tierWithin(planTier: ModelTier, modelTier: ModelTier): boolean {
  return MODEL_TIER_RANK[modelTier] <= MODEL_TIER_RANK[planTier];
}

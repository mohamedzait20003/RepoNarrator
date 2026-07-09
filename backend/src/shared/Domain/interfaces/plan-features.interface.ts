export interface PlanFeatures {
  privateRepos: boolean;
  bulkGenerate: boolean;
  directPush: boolean;
  watermark: boolean;
  /**
   * Monthly "Narrate Yourself" runs — the profile README generated from all
   * repos + résumé. Distinct from per-repo README generations (`Plan.generationLimit`),
   * as it's a heavier, whole-account operation. -1 = unlimited.
   */
  profileNarrations: number;
  /** 0 = none, -1 = unlimited */
  customTemplates: number;
  /** Days to retain generation history. -1 = unlimited */
  historyRetentionDays: number;
  apiAccess: boolean;
}

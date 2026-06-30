export interface PlanFeatures {
  privateRepos: boolean;
  bulkGenerate: boolean;
  directPush: boolean;
  watermark: boolean;
  /** 0 = none, -1 = unlimited */
  customTemplates: number;
  /** Days to retain generation history. -1 = unlimited */
  historyRetentionDays: number;
  apiAccess: boolean;
}

import type { ApiResponse } from "./baseModel";

/** An AI model the user can pick (mirrors the backend AiModelView). */
export interface AiModelItem {
  Id: string;
  Name: string;
  Description: string | null;
  Tier: string;
  IsDefault: boolean;
}

export type AiModelsResponse = ApiResponse<AiModelItem[]>;

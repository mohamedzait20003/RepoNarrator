import type { ApiResponse } from "./baseModel";

export type NarrationStatus = "queued" | "running" | "completed" | "failed";

/** A "Narrate Yourself" job (mirrors the backend NarrationView). */
export interface Narration {
  Id: string;
  Status: NarrationStatus;
  /** Fine-grained progress: gathering / analyzing / drafting / reviewing / completed. */
  Phase: string | null;
  GeneratedMd: string | null;
  Model: string | null;
  Error: string | null;
  CreatedAt: string;
}

export interface NarrationStart {
  Id: string;
}

export type NarrationResponse = ApiResponse<Narration>;
export type NarrationStartResponse = ApiResponse<NarrationStart>;

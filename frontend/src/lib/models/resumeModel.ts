import type { ApiResponse } from "./baseModel";

export type ResumeSource = "upload" | "link";

/** A saved resume (mirrors the backend ResumeView). */
export interface ResumeItem {
  Id: string;
  Source: ResumeSource;
  /** External link for `link` resumes; null for uploads (fetch via download). */
  Url: string | null;
  /** Original filename for uploads; null for links. */
  Name: string | null;
  CreatedAt: string;
}

/** GET /resumes payload — saved resumes + the plan cap (-1 = unlimited). */
export interface ResumeList {
  Items: ResumeItem[];
  Limit: number;
}

/** GET /resumes/:id/download — a short-lived presigned URL (or the link URL). */
export interface ResumeDownload {
  Url: string;
}

export type ResumesResponse = ApiResponse<ResumeList>;
export type ResumeResponse = ApiResponse<ResumeItem>;
export type ResumeDownloadResponse = ApiResponse<ResumeDownload>;

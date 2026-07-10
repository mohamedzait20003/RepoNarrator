import type { ResumeSource } from '@/shared/Domain/enums/resume-source.enum';

/** A saved résumé as returned to the client. */
export interface ResumeView {
  Id: string;
  Source: ResumeSource;
  /** External link for `link` résumés; null for uploads (fetch via /download). */
  Url: string | null;
  /** Original filename for uploads; null for links. */
  Name: string | null;
  CreatedAt: string;
}

/** GET /resumes payload — the saved résumés plus the caller's plan cap (-1 = unlimited). */
export interface ResumeListView {
  Items: ResumeView[];
  Limit: number;
}

/** GET /resumes/:id/download — a short-lived presigned URL (or the link's URL). */
export interface ResumeDownloadView {
  Url: string;
}

/**
 * The subset of a Multer upload we actually use. Declared locally so we don't
 * need the `@types/multer` dependency just for one parameter type.
 */
export interface UploadedResumeFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

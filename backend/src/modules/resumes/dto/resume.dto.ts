import type { ResumeSource } from '@/shared/Domain/enums/resume-source.enum';

/** A saved résumé as returned to the client. */
export interface ResumeView {
  Id: string;
  Source: ResumeSource;
  /** External link for `link` résumés; null for uploads. */
  Url: string | null;
  CreatedAt: string;
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

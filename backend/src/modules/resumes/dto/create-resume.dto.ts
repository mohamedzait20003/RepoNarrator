import { IsOptional, IsUrl, MaxLength } from 'class-validator';

/**
 * Body for POST /resumes. Provide `url` for a link résumé, or upload a `file`
 * (multipart/form-data) — the service requires exactly one.
 */
export class CreateResumeDto {
  @IsOptional()
  @IsUrl(
    { require_protocol: true },
    { message: 'Provide a valid URL including https://.' },
  )
  @MaxLength(2048)
  url?: string;
}

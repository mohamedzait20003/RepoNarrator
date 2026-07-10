import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/** Body for POST /narrations — both fields optional (intent steers, model defaults). */
export class StartNarrationDto {
  /** The user's steering description for the profile README. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  intent?: string;

  /** Chosen AI model (from GET /ai-models). Validated against the caller's plan tier. */
  @IsOptional()
  @IsUUID()
  modelId?: string;
}

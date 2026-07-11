import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Body for POST /narrations/tailor — the user's rough note to sharpen. */
export class TailorNarrationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  draft: string;
}

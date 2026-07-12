import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/** Body for POST /narrations/:id/commit — the (edited) README markdown to push. */
export class CommitNarrationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100_000)
  content: string;
}

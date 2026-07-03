import { IsString, MinLength } from 'class-validator';

export class EmailVerifyDto {
  @IsString()
  @MinLength(1)
  token: string;
}

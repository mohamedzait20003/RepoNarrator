import { IsString, MinLength } from 'class-validator';

export class GithubExchangeDto {
  @IsString()
  @MinLength(1)
  code: string;

  @IsString()
  @MinLength(1)
  state: string;
}

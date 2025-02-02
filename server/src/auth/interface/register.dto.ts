import { IsString, MinLength } from 'class-validator';

export class Register {
  @IsString()
  @MinLength(5)
  id: string;

  @IsString()
  @MinLength(10)
  data: string;

  @IsString()
  @MinLength(1)
  type: string;
}

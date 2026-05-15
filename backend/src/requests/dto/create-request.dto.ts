import { IsString, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { RequestType } from '@prisma/client';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  requestedBy: string;

  @IsEnum(RequestType)
  type: RequestType;
}

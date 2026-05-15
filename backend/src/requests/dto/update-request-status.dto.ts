import { IsEnum, IsString } from 'class-validator';
import { RequestStatus } from '@prisma/client';

export class UpdateRequestStatusDto {
  @IsEnum(RequestStatus)
  status: RequestStatus;

  @IsString()
  role: string; // Used to simulate role-based check
}

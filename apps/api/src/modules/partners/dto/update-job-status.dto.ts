import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '@/database/entities';

export class UpdateJobStatusDto {
  @ApiProperty({ enum: JobStatus, example: JobStatus.ACCEPTED })
  @IsEnum(JobStatus)
  status!: JobStatus;
}

import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProposeRescheduleDto {
  @ApiProperty({ example: '2026-04-15' })
  @IsDateString()
  proposed_date!: string;

  @ApiProperty({ example: '9AM-12PM' })
  @IsString()
  @MaxLength(20)
  proposed_time_slot!: string;

  @ApiPropertyOptional({
    enum: [
      'traffic',
      'previous_job_overran',
      'vehicle_issue',
      'personal_emergency',
      'sick',
      'vehicle_breakdown',
      'scheduling_conflict',
      'weather',
      'parts_unavailable',
      'other',
    ],
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason_note?: string;
}

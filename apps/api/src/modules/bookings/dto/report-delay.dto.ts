import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportDelayDto {
  @ApiProperty({ enum: ['running_late', 'cannot_attend'] })
  @IsEnum(['running_late', 'cannot_attend'])
  delay_type!: string;

  @ApiProperty({
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
  @IsEnum([
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
  ])
  reason!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason_note?: string;

  @ApiPropertyOptional({ example: '2026-04-13T14:30:00Z' })
  @IsOptional()
  @IsString()
  revised_eta?: string;
}

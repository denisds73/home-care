import { IsEnum, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RespondRescheduleDto {
  @ApiProperty({ enum: ['accepted', 'rejected', 'counter_proposed'] })
  @IsEnum(['accepted', 'rejected', 'counter_proposed'])
  response!: string;

  @ApiPropertyOptional({ example: '2026-04-16' })
  @IsOptional()
  @IsDateString()
  counter_date?: string;

  @ApiPropertyOptional({ example: '12PM-3PM' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  counter_time_slot?: string;
}

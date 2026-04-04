import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@/database/entities';

export class QueryBookingsDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiPropertyOptional({ example: 'Cleaning' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsString()
  @IsOptional()
  date_from?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsString()
  @IsOptional()
  date_to?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  search?: string;
}

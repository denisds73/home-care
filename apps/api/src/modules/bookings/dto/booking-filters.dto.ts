import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsIn,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@/database/entities';

/** Matches `categories.id` / `bookings.category` slugs */
export const ADMIN_BOOKING_CATEGORY_VALUES = [
  'ac',
  'tv',
  'refrigerator',
  'microwave',
  'water_purifier',
  'washing_machine',
] as const;

export class BookingFiltersDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ enum: ADMIN_BOOKING_CATEGORY_VALUES })
  @IsOptional()
  @IsIn(ADMIN_BOOKING_CATEGORY_VALUES)
  category?: (typeof ADMIN_BOOKING_CATEGORY_VALUES)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vendor_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiPropertyOptional({
    description:
      'Partial match on booking id, customer name, service name, or phone',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

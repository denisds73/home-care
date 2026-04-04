import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
  MaxLength,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMode } from '@/database/entities';

class ServicesListItemDto {
  @ApiProperty()
  @IsNumber()
  id!: number;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  qty!: number;
}

export class CreateBookingDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  customer_name!: string;

  @ApiProperty({ maxLength: 20 })
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty()
  @IsString()
  address!: string;

  @ApiProperty()
  @IsNumber()
  lat!: number;

  @ApiProperty()
  @IsNumber()
  lng!: number;

  @ApiProperty({ maxLength: 50 })
  @IsString()
  @MaxLength(50)
  category!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  service_id?: number;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  service_name!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ type: [ServicesListItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicesListItemDto)
  services_list!: ServicesListItemDto[];

  @ApiProperty({ example: '2026-04-10' })
  @IsDateString()
  preferred_date!: string;

  @ApiProperty({ maxLength: 20, example: '10:00-12:00' })
  @IsString()
  @MaxLength(20)
  time_slot!: string;

  @ApiProperty({ enum: PaymentMode })
  @IsEnum(PaymentMode)
  payment_mode!: PaymentMode;
}

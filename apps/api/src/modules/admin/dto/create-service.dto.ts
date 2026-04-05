import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  MaxLength,
  Min,
  Max,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FaqItemDto {
  @IsString()
  @MaxLength(200)
  question!: string;

  @IsString()
  @MaxLength(500)
  answer!: string;
}

export class CreateServiceDto {
  @ApiProperty({ example: 'Cleaning', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  category!: string;

  @ApiProperty({ example: 'Deep Cleaning', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  service_name!: string;

  @ApiProperty({ example: 'Full home deep cleaning service' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 499.99, minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  is_basic?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 'Detailed description of the service...' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  long_description?: string;

  @ApiPropertyOptional({ example: 599.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  original_price?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;

  @ApiPropertyOptional({ example: '45-60 min' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  estimated_duration?: string;

  @ApiPropertyOptional({ example: ['Gas refill', 'Leak test'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  @ArrayMaxSize(10)
  inclusions?: string[];

  @ApiPropertyOptional({ example: ['Spare parts'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  @ArrayMaxSize(10)
  exclusions?: string[];

  @ApiPropertyOptional({ type: [FaqItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  @ArrayMaxSize(10)
  faqs?: FaqItemDto[];

  @ApiPropertyOptional({ example: 4.7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating_average?: number;

  @ApiPropertyOptional({ example: 1250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rating_count?: number;

  @ApiPropertyOptional({ example: [72, 18, 6, 3, 1] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMaxSize(5)
  rating_distribution?: number[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}

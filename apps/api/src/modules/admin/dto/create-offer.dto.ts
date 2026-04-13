import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty({ example: '20% Off AC Services', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  title!: string;

  @ApiPropertyOptional({ example: 'Deep cleaning, gas refill & installation' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 'Limited Time', maxLength: 30 })
  @IsString()
  @MaxLength(30)
  tag!: string;

  @ApiPropertyOptional({ example: 'Book Now', maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  cta_text?: string;

  @ApiProperty({ example: 'ac', maxLength: 50 })
  @IsString()
  @MaxLength(50)
  category!: string;

  @ApiPropertyOptional({ example: 'https://example.com/offer.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image_url?: string;

  @ApiProperty({ example: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%)' })
  @IsString()
  @MaxLength(300)
  bg_gradient!: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort_order?: number;
}

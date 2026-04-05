import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}

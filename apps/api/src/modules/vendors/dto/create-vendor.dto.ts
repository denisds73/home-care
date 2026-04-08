import {
  IsString,
  IsEmail,
  IsArray,
  IsOptional,
  IsBoolean,
  ArrayNotEmpty,
  ArrayMinSize,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVendorDto {
  @ApiProperty({ example: 'Sparkle Home Services Pvt Ltd', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  company_name!: string;

  @ApiProperty({ example: '9876543210', description: 'Indian mobile (6-9 start, 10 digits)' })
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'contact_number must be a valid 10-digit Indian mobile starting with 6-9',
  })
  contact_number!: string;

  @ApiProperty({ example: 'contact@sparkle.in' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'Bengaluru', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  city!: string;

  @ApiProperty({ example: ['560001', '560034'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @Matches(/^\d{6}$/, { each: true, message: 'each PIN code must be 6 digits' })
  pin_codes!: string[];

  @ApiProperty({ example: '22AAAAA0000A1Z5', description: '15-char GSTIN' })
  @IsString()
  @Matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, {
    message: 'gst_number must be a valid 15-char GSTIN',
  })
  gst_number!: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  gst_verified?: boolean;

  @ApiProperty({ example: ['cleaning', 'plumbing'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  category_ids!: string[];

  @ApiPropertyOptional({ example: 'Onboarded via trade fair lead' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

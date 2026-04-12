import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TechnicianStatus } from '@/database/entities';

export class CreateTechnicianDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  full_name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  phone!: string;

  @ApiProperty()
  @IsEmail()
  @MaxLength(120)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  skills!: string[];

  @ApiPropertyOptional({ enum: TechnicianStatus })
  @IsOptional()
  @IsEnum(TechnicianStatus)
  status?: TechnicianStatus;
}

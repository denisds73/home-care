import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePartnerDto {
  @ApiPropertyOptional({ type: [String], example: ['plumbing', 'electrical'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ example: 'Mumbai - Andheri' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  service_area?: string;
}

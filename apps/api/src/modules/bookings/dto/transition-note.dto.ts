import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TransitionNoteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @ApiPropertyOptional({ description: '6-digit OTP for technician completion' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{6}$/)
  otp?: string;
}

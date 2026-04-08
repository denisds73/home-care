import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TechnicianStatus } from '@/database/entities';

export class UpdateTechnicianStatusDto {
  @ApiProperty({ enum: TechnicianStatus })
  @IsEnum(TechnicianStatus)
  status!: TechnicianStatus;
}

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PartnerStatus } from '@/database/entities';

export class UpdatePartnerStatusDto {
  @ApiProperty({ enum: PartnerStatus, example: PartnerStatus.APPROVED })
  @IsEnum(PartnerStatus)
  status!: PartnerStatus;
}

import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { VendorStatus } from '@/database/entities';

export class UpdateVendorStatusDto {
  @ApiProperty({ enum: VendorStatus })
  @IsEnum(VendorStatus)
  status!: VendorStatus;
}

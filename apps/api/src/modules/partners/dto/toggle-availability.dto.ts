import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ToggleAvailabilityDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  is_online!: boolean;
}

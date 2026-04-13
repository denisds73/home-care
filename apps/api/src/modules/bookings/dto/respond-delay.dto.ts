import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondDelayDto {
  @ApiProperty({ enum: ['accepted', 'reschedule_requested', 'cancelled'] })
  @IsEnum(['accepted', 'reschedule_requested', 'cancelled'])
  response!: string;
}

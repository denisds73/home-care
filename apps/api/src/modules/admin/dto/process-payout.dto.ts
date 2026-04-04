import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PayoutStatus } from '@/database/entities';

export class ProcessPayoutDto {
  @ApiProperty({
    enum: [PayoutStatus.PROCESSED, PayoutStatus.REJECTED],
    example: PayoutStatus.PROCESSED,
  })
  @IsIn([PayoutStatus.PROCESSED, PayoutStatus.REJECTED])
  status!: PayoutStatus.PROCESSED | PayoutStatus.REJECTED;
}

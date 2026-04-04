import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Order amount in smallest currency unit', minimum: 1 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({ description: 'Currency code (e.g. INR)', example: 'INR' })
  @IsString()
  currency!: string;

  @ApiProperty({ description: 'Unique receipt identifier for this order' })
  @IsString()
  receipt!: string;
}

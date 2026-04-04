import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'Razorpay order ID returned from createOrder' })
  @IsString()
  razorpay_order_id!: string;

  @ApiProperty({ description: 'Razorpay payment ID from checkout callback' })
  @IsString()
  razorpay_payment_id!: string;

  @ApiProperty({ description: 'HMAC-SHA256 signature for verification' })
  @IsString()
  razorpay_signature!: string;
}

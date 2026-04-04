import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import {
  BookingEntity,
  PaymentStatus,
  TransactionEntity,
  TransactionType,
} from '@/database/entities';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

interface CreateOrderResult {
  order_id: string;
  amount: number;
  currency: string;
}

interface VerifyPaymentResult {
  success: boolean;
  transaction_id: string;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly isDev: boolean;

  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepo: Repository<TransactionEntity>,
  ) {
    this.isDev = process.env.NODE_ENV !== 'production';
  }

  async createOrder(dto: CreateOrderDto): Promise<CreateOrderResult> {
    if (this.isDev) {
      const mockOrderId = `order_mock_${crypto.randomBytes(12).toString('hex')}`;
      this.logger.debug(`[DEV] Created mock Razorpay order: ${mockOrderId}`);
      return {
        order_id: mockOrderId,
        amount: dto.amount,
        currency: dto.currency,
      };
    }

    // Production: use Razorpay SDK
    const Razorpay = await import('razorpay');
    const instance = new Razorpay.default({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await instance.orders.create({
      amount: dto.amount,
      currency: dto.currency,
      receipt: dto.receipt,
    });

    return {
      order_id: order.id,
      amount: order.amount as number,
      currency: order.currency,
    };
  }

  async verifyPayment(
    dto: VerifyPaymentDto,
    userId: string,
  ): Promise<VerifyPaymentResult> {
    if (this.isDev) {
      return this.handleVerifiedPayment(dto.razorpay_order_id, userId);
    }

    // Production: verify HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new BadRequestException('Payment verification is not configured');
    }

    const body = `${dto.razorpay_order_id}|${dto.razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== dto.razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    return this.handleVerifiedPayment(dto.razorpay_order_id, userId);
  }

  private async handleVerifiedPayment(
    razorpayOrderId: string,
    userId: string,
  ): Promise<VerifyPaymentResult> {
    // Find the booking by razorpay_order_id
    const booking = await this.bookingRepo.findOne({
      where: { razorpay_order_id: razorpayOrderId },
    });

    if (booking) {
      booking.payment_status = PaymentStatus.SUCCESS;
      await this.bookingRepo.save(booking);
    } else {
      this.logger.warn(
        `No booking found for razorpay_order_id: ${razorpayOrderId}`,
      );
    }

    // Create a credit transaction
    const transaction = this.transactionRepo.create({
      user_id: userId,
      amount: booking?.price ?? 0,
      type: TransactionType.CREDIT,
      description: booking
        ? `Payment for booking ${booking.booking_id}`
        : `Payment for order ${razorpayOrderId}`,
      booking_ref: booking?.booking_id ?? razorpayOrderId,
    });

    const saved = await this.transactionRepo.save(transaction);

    return {
      success: true,
      transaction_id: saved.id,
    };
  }
}

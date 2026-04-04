import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  TransactionEntity,
  TransactionType,
  PayoutRequestEntity,
  PayoutStatus,
  PartnerEntity,
} from '@/database/entities';
import { RequestPayoutDto } from './dto/request-payout.dto';

interface TransactionResponse {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  bookingRef?: string;
  date: string;
}

interface PayoutResponse {
  id: string;
  partnerId: string;
  partnerName: string;
  amount: number;
  status: 'pending' | 'processed' | 'rejected';
  requestedAt: string;
  processedAt?: string;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(PayoutRequestEntity)
    private readonly payoutRepo: Repository<PayoutRequestEntity>,
    @InjectRepository(PartnerEntity)
    private readonly partnerRepo: Repository<PartnerEntity>,
  ) {}

  async getBalance(userId: string): Promise<{ balance: number }> {
    const result = await this.transactionRepo
      .createQueryBuilder('t')
      .select(
        `COALESCE(SUM(CASE WHEN t.type = :credit THEN t.amount ELSE 0 END), 0) - ` +
          `COALESCE(SUM(CASE WHEN t.type = :debit THEN t.amount ELSE 0 END), 0)`,
        'balance',
      )
      .where('t.user_id = :userId', { userId })
      .setParameters({
        credit: TransactionType.CREDIT,
        debit: TransactionType.DEBIT,
      })
      .getRawOne();

    return { balance: parseFloat(result?.balance ?? '0') };
  }

  async getTransactions(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: TransactionResponse[]; total: number }> {
    const [rows, total] = await this.transactionRepo.findAndCount({
      where: { user_id: userId },
      order: { date: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const data: TransactionResponse[] = rows.map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type,
      description: t.description,
      bookingRef: t.booking_ref ?? undefined,
      date: t.date.toISOString(),
    }));

    return { data, total };
  }

  async requestPayout(
    userId: string,
    dto: RequestPayoutDto,
  ): Promise<PayoutResponse> {
    // Look up the partner record by user_id
    const partner = await this.partnerRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }

    // Check sufficient balance
    const { balance } = await this.getBalance(userId);
    if (balance < dto.amount) {
      throw new BadRequestException(
        `Insufficient balance. Current balance: ${balance}`,
      );
    }

    // Create the payout request
    const payout = this.payoutRepo.create({
      partner_id: partner.id,
      partner_name: partner.user?.name ?? 'Unknown',
      amount: dto.amount,
      status: PayoutStatus.PENDING,
    });

    const saved = await this.payoutRepo.save(payout);

    // Create a debit transaction to reflect the pending payout
    const transaction = this.transactionRepo.create({
      user_id: userId,
      amount: dto.amount,
      type: TransactionType.DEBIT,
      description: `Payout request #${saved.id}`,
    });
    await this.transactionRepo.save(transaction);

    return {
      id: saved.id,
      partnerId: saved.partner_id,
      partnerName: saved.partner_name,
      amount: Number(saved.amount),
      status: saved.status,
      requestedAt: saved.requested_at.toISOString(),
      processedAt: saved.processed_at?.toISOString(),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OfferEntity } from '@/database/entities';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(OfferEntity)
    private readonly offerRepo: Repository<OfferEntity>,
  ) {}

  async findActive(): Promise<OfferEntity[]> {
    return this.offerRepo.find({
      where: { is_active: true },
      order: { sort_order: 'ASC' },
    });
  }
}

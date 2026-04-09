import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingEntity,
  ServiceEntity,
  UserEntity,
  PartnerEntity,
  PayoutRequestEntity,
  OfferEntity,
} from '@/database/entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      ServiceEntity,
      UserEntity,
      PartnerEntity,
      PayoutRequestEntity,
      OfferEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

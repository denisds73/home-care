import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingEntity,
  BookingReviewEntity,
  ServiceEntity,
  UserEntity,
  VendorEntity,
  OfferEntity,
} from '@/database/entities';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      BookingReviewEntity,
      ServiceEntity,
      UserEntity,
      VendorEntity,
      OfferEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

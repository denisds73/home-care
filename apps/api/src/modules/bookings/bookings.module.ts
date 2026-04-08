import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingEntity,
  BookingStatusEventEntity,
  BookingReviewEntity,
  VendorEntity,
} from '@/database/entities';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      BookingStatusEventEntity,
      BookingReviewEntity,
      VendorEntity,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

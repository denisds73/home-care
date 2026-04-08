import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingEntity,
  BookingStatusEventEntity,
  BookingReviewEntity,
  UserEntity,
  VendorEntity,
  TechnicianEntity,
} from '@/database/entities';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookingEntity,
      BookingStatusEventEntity,
      BookingReviewEntity,
      UserEntity,
      VendorEntity,
      TechnicianEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

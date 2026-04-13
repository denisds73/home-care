import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BookingEntity,
  BookingStatusEventEntity,
  BookingReviewEntity,
  UserEntity,
  VendorEntity,
  TechnicianEntity,
  DelayEventEntity,
  RescheduleRequestEntity,
} from '@/database/entities';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { DelayService } from './delay.service';
import { RescheduleService } from './reschedule.service';
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
      DelayEventEntity,
      RescheduleRequestEntity,
    ]),
    NotificationsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, DelayService, RescheduleService],
  exports: [BookingsService, DelayService, RescheduleService],
})
export class BookingsModule {}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RescheduleRequestEntity,
  RescheduleStatus,
  RescheduleInitiator,
  BookingEntity,
  BookingStatus,
  NotificationType,
} from '@/database/entities';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { BookingActor } from './bookings.service';

const MAX_RESCHEDULES = 3;

const NON_RESCHEDULABLE = new Set([
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
  BookingStatus.CANCELLED,
  BookingStatus.REJECTED,
]);

@Injectable()
export class RescheduleService {
  constructor(
    @InjectRepository(RescheduleRequestEntity)
    private readonly rescheduleRepo: Repository<RescheduleRequestEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async propose(
    bookingId: string,
    actor: BookingActor,
    dto: {
      proposed_date: string;
      proposed_time_slot: string;
      reason?: string;
      reason_note?: string;
    },
  ): Promise<RescheduleRequestEntity> {
    const booking = await this.bookingRepo.findOne({
      where: { booking_id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (NON_RESCHEDULABLE.has(booking.booking_status)) {
      throw new BadRequestException(
        `Cannot reschedule booking with status "${booking.booking_status}"`,
      );
    }

    // Count existing reschedules for this booking
    const count = await this.rescheduleRepo.count({
      where: { booking_id: bookingId },
    });
    if (count >= MAX_RESCHEDULES) {
      throw new BadRequestException(
        `Maximum ${MAX_RESCHEDULES} reschedules reached for this booking`,
      );
    }

    // Expire any pending reschedule for this booking
    await this.rescheduleRepo.update(
      { booking_id: bookingId, status: RescheduleStatus.PROPOSED },
      { status: RescheduleStatus.EXPIRED },
    );
    await this.rescheduleRepo.update(
      { booking_id: bookingId, status: RescheduleStatus.COUNTER_PROPOSED },
      { status: RescheduleStatus.EXPIRED },
    );

    const roleMap: Record<string, RescheduleInitiator> = {
      customer: RescheduleInitiator.CLIENT,
      vendor: RescheduleInitiator.VENDOR,
      technician: RescheduleInitiator.TECHNICIAN,
      admin: RescheduleInitiator.ADMIN,
    };

    const request = this.rescheduleRepo.create({
      booking_id: bookingId,
      initiated_by_user_id: actor.id,
      initiated_by_role: roleMap[actor.role] ?? RescheduleInitiator.CLIENT,
      reason: dto.reason ?? 'other',
      reason_note: dto.reason_note ?? null,
      original_date: booking.preferred_date,
      original_time_slot: booking.time_slot,
      proposed_date: dto.proposed_date,
      proposed_time_slot: dto.proposed_time_slot,
      status: RescheduleStatus.PROPOSED,
      reschedule_number: count + 1,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    const saved = await this.rescheduleRepo.save(request);

    // Notify the appropriate party
    if (actor.role === 'customer' && booking.vendor_id) {
      await this.notificationsService.create(
        booking.vendor_id,
        NotificationType.BOOKING,
        'Reschedule Requested',
        `Customer requests to reschedule ${booking.service_name} to ${dto.proposed_date} ${dto.proposed_time_slot}`,
        bookingId,
      );
    } else if (booking.customer_id) {
      await this.notificationsService.create(
        booking.customer_id,
        NotificationType.BOOKING,
        'Reschedule Proposed',
        `A reschedule has been proposed for ${booking.service_name} to ${dto.proposed_date} ${dto.proposed_time_slot}`,
        bookingId,
      );
    }

    return saved;
  }

  async respond(
    bookingId: string,
    rescheduleId: string,
    actor: BookingActor,
    dto: {
      response: string;
      counter_date?: string;
      counter_time_slot?: string;
    },
  ): Promise<RescheduleRequestEntity> {
    const request = await this.rescheduleRepo.findOne({
      where: { id: rescheduleId, booking_id: bookingId },
    });
    if (!request) throw new NotFoundException('Reschedule request not found');

    if (
      request.status !== RescheduleStatus.PROPOSED &&
      request.status !== RescheduleStatus.COUNTER_PROPOSED
    ) {
      throw new BadRequestException(
        'This reschedule request can no longer be responded to',
      );
    }

    request.responded_by_user_id = actor.id;
    request.responded_by_role = actor.role;

    if (dto.response === 'accepted') {
      request.status = RescheduleStatus.ACCEPTED;

      const booking = await this.bookingRepo.findOne({
        where: { booking_id: bookingId },
      });
      if (booking) {
        const finalDate = request.counter_date ?? request.proposed_date;
        const finalSlot =
          request.counter_time_slot ?? request.proposed_time_slot;
        booking.preferred_date = finalDate;
        booking.time_slot = finalSlot;
        await this.bookingRepo.save(booking);

        if (booking.customer_id) {
          await this.notificationsService.create(
            booking.customer_id,
            NotificationType.BOOKING,
            'Reschedule Confirmed',
            `${booking.service_name} has been rescheduled to ${finalDate} ${finalSlot}`,
            bookingId,
          );
        }
      }
    } else if (dto.response === 'rejected') {
      request.status = RescheduleStatus.REJECTED;
    } else if (dto.response === 'counter_proposed') {
      if (!dto.counter_date || !dto.counter_time_slot) {
        throw new BadRequestException(
          'Counter date and time slot are required for counter-proposals',
        );
      }
      request.status = RescheduleStatus.COUNTER_PROPOSED;
      request.counter_date = dto.counter_date;
      request.counter_time_slot = dto.counter_time_slot;

      const booking = await this.bookingRepo.findOne({
        where: { booking_id: bookingId },
      });
      if (booking?.customer_id) {
        await this.notificationsService.create(
          booking.customer_id,
          NotificationType.BOOKING,
          'Counter-Proposal',
          `A different time has been suggested for ${booking.service_name}: ${dto.counter_date} ${dto.counter_time_slot}`,
          bookingId,
        );
      }
    }

    return this.rescheduleRepo.save(request);
  }

  async getRequests(bookingId: string): Promise<RescheduleRequestEntity[]> {
    return this.rescheduleRepo.find({
      where: { booking_id: bookingId },
      order: { created_at: 'DESC' },
    });
  }

  async getActiveRequest(
    bookingId: string,
  ): Promise<RescheduleRequestEntity | null> {
    return this.rescheduleRepo.findOne({
      where: [
        { booking_id: bookingId, status: RescheduleStatus.PROPOSED },
        { booking_id: bookingId, status: RescheduleStatus.COUNTER_PROPOSED },
      ],
    });
  }

  async getRescheduleCount(bookingId: string): Promise<number> {
    return this.rescheduleRepo.count({ where: { booking_id: bookingId } });
  }
}

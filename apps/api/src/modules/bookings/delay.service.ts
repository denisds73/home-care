import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DelayEventEntity,
  DelayType,
  DelayReason,
  ClientDelayResponse,
} from '@/database/entities/delay-event.entity';
import {
  BookingEntity,
  BookingStatus,
  NotificationType,
} from '@/database/entities';
import { NotificationsService } from '@/modules/notifications/notifications.service';
import { BookingActor } from './bookings.service';

const REPORTABLE_STATUSES = new Set([
  BookingStatus.ASSIGNED,
  BookingStatus.ACCEPTED,
  BookingStatus.IN_PROGRESS,
]);

@Injectable()
export class DelayService {
  constructor(
    @InjectRepository(DelayEventEntity)
    private readonly delayRepo: Repository<DelayEventEntity>,
    @InjectRepository(BookingEntity)
    private readonly bookingRepo: Repository<BookingEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async reportDelay(
    bookingId: string,
    actor: BookingActor,
    dto: {
      delay_type: string;
      reason: string;
      reason_note?: string;
      revised_eta?: string;
    },
  ): Promise<DelayEventEntity> {
    const booking = await this.bookingRepo.findOne({
      where: { booking_id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (!REPORTABLE_STATUSES.has(booking.booking_status)) {
      throw new BadRequestException(
        `Cannot report delay on booking with status "${booking.booking_status}"`,
      );
    }

    if (dto.delay_type === 'running_late' && !dto.revised_eta) {
      throw new BadRequestException(
        'Revised ETA is required for running late delays',
      );
    }

    if (dto.delay_type === 'cannot_attend' && !dto.reason_note) {
      throw new BadRequestException(
        'A note is required when reporting cannot attend',
      );
    }

    // Deactivate any existing active delay for this booking
    await this.delayRepo.update(
      { booking_id: bookingId, is_active: true },
      { is_active: false },
    );

    // Compute original_eta from booking time_slot
    const slotStart =
      booking.time_slot.split('-')[0]?.trim() ?? booking.time_slot;
    const originalEta = `${booking.preferred_date}T${this.parseSlotTime(slotStart)}`;

    const delay = this.delayRepo.create({
      booking_id: bookingId,
      delay_type: dto.delay_type as DelayType,
      reason: dto.reason as DelayReason,
      reason_note: dto.reason_note ?? null,
      revised_eta: dto.revised_eta ? new Date(dto.revised_eta) : null,
      original_eta: originalEta,
      reported_by_user_id: actor.id,
      reported_by_role: actor.role,
      client_response: ClientDelayResponse.PENDING,
      is_active: true,
    });

    const saved = await this.delayRepo.save(delay);

    // Notify the customer
    if (booking.customer_id) {
      const title =
        dto.delay_type === 'cannot_attend'
          ? 'Technician Cannot Attend'
          : 'Service Delayed';
      const desc =
        dto.delay_type === 'cannot_attend'
          ? `Your technician cannot attend for ${booking.service_name}. Please check your booking for options.`
          : `Your technician is running late for ${booking.service_name}. Revised ETA provided.`;

      await this.notificationsService.create(
        booking.customer_id,
        NotificationType.BOOKING,
        title,
        desc,
        bookingId,
      );
    }

    return saved;
  }

  async respondToDelay(
    bookingId: string,
    delayId: string,
    actor: BookingActor,
    dto: { response: string },
  ): Promise<DelayEventEntity> {
    const delay = await this.delayRepo.findOne({
      where: { id: delayId, booking_id: bookingId },
    });
    if (!delay) throw new NotFoundException('Delay event not found');

    if (!delay.is_active) {
      throw new BadRequestException('This delay event is no longer active');
    }

    delay.client_response = dto.response as ClientDelayResponse;
    delay.client_responded_at = new Date();

    // If client cancelled or accepted, deactivate the delay (resolved)
    if (dto.response === 'cancelled' || dto.response === 'accepted') {
      delay.is_active = false;
    }

    return this.delayRepo.save(delay);
  }

  async getDelayEvents(bookingId: string): Promise<DelayEventEntity[]> {
    return this.delayRepo.find({
      where: { booking_id: bookingId },
      order: { created_at: 'DESC' },
    });
  }

  async getActiveDelay(bookingId: string): Promise<DelayEventEntity | null> {
    return this.delayRepo.findOne({
      where: { booking_id: bookingId, is_active: true },
    });
  }

  private parseSlotTime(slot: string): string {
    // Converts "9AM" -> "09:00:00", "12PM" -> "12:00:00", "3PM" -> "15:00:00"
    const match = slot.match(/^(\d{1,2})(AM|PM)$/i);
    if (!match) return '09:00:00';
    let hour = parseInt(match[1], 10);
    const period = match[2].toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:00:00`;
  }
}

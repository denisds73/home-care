import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity, BookingStatus, Role } from '@/database/entities';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingsRepository: Repository<BookingEntity>,
  ) {}

  async create(
    customerId: string,
    dto: CreateBookingDto,
  ): Promise<BookingEntity> {
    const booking = this.bookingsRepository.create({
      ...dto,
      customer_id: customerId,
      booking_status: BookingStatus.PENDING,
    });
    return this.bookingsRepository.save(booking);
  }

  async findByCustomer(customerId: string): Promise<BookingEntity[]> {
    return this.bookingsRepository.find({
      where: { customer_id: customerId },
      order: { created_at: 'DESC' },
    });
  }

  async findById(
    bookingId: string,
    userId: string,
    userRole: Role,
  ): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { booking_id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (userRole !== Role.ADMIN && booking.customer_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this booking',
      );
    }

    return booking;
  }

  async cancel(bookingId: string, userId: string): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { booking_id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.customer_id !== userId) {
      throw new ForbiddenException(
        'You do not have access to this booking',
      );
    }

    const cancellableStatuses: BookingStatus[] = [
      BookingStatus.PENDING,
      BookingStatus.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(booking.booking_status)) {
      throw new BadRequestException(
        `Cannot cancel a booking with status "${booking.booking_status}". Only Pending or Confirmed bookings can be cancelled.`,
      );
    }

    booking.booking_status = BookingStatus.CANCELLED;
    return this.bookingsRepository.save(booking);
  }
}

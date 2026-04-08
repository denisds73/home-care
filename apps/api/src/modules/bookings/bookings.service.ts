import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { randomInt } from 'crypto';
import {
  BookingEntity,
  BookingStatus,
  BookingStatusEventEntity,
  BookingReviewEntity,
  Role,
  VendorEntity,
  TechnicianEntity,
} from '@/database/entities';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingFiltersDto } from './dto/booking-filters.dto';
import {
  BookingEvent,
  ALLOWED_TRANSITIONS,
  applyTransition,
  canTransition,
} from './lifecycle';

export interface BookingActor {
  id: string;
  role: Role;
  vendor_id?: string | null;
  technician_id?: string | null;
}

interface TransitionOptions {
  note?: string;
  vendor_id?: string;
  otp?: string;
}

const OTP_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingsRepository: Repository<BookingEntity>,
    @InjectRepository(BookingStatusEventEntity)
    private readonly eventsRepository: Repository<BookingStatusEventEntity>,
    @InjectRepository(BookingReviewEntity)
    private readonly reviewsRepository: Repository<BookingReviewEntity>,
    @InjectRepository(VendorEntity)
    private readonly vendorsRepository: Repository<VendorEntity>,
    @InjectRepository(TechnicianEntity)
    private readonly techniciansRepository: Repository<TechnicianEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    customerId: string,
    dto: CreateBookingDto,
  ): Promise<BookingEntity> {
    return this.dataSource.transaction(async (manager) => {
      const booking = manager.create(BookingEntity, {
        ...dto,
        customer_id: customerId,
        booking_status: BookingStatus.PENDING,
      });
      const saved = await manager.save(booking);

      const event = manager.create(BookingStatusEventEntity, {
        booking_id: saved.booking_id,
        from_status: null,
        to_status: BookingStatus.PENDING,
        event: 'create',
        actor_user_id: customerId,
        actor_role: Role.CUSTOMER,
        note: null,
      });
      await manager.save(event);

      return saved;
    });
  }

  async findByCustomer(customerId: string): Promise<BookingEntity[]> {
    return this.bookingsRepository.find({
      where: { customer_id: customerId },
      order: { created_at: 'DESC' },
    });
  }

  async findByVendor(
    vendorId: string,
    filters: { status?: BookingStatus } = {},
  ): Promise<BookingEntity[]> {
    return this.bookingsRepository.find({
      where: {
        vendor_id: vendorId,
        ...(filters.status ? { booking_status: filters.status } : {}),
      },
      order: { created_at: 'DESC' },
    });
  }

  async findByTechnician(
    technicianId: string,
    filters: { status?: BookingStatus } = {},
  ): Promise<BookingEntity[]> {
    const items = await this.bookingsRepository.find({
      where: {
        technician_id: technicianId,
        ...(filters.status ? { booking_status: filters.status } : {}),
      },
      order: { created_at: 'DESC' },
    });
    // Technicians see the OTP so they can't read it off the customer screen
    // — but they must have it entered by the customer during completion.
    // Strip it from list views; only reveal on individual booking detail.
    return items.map((b) => ({ ...b, completion_otp: null }) as BookingEntity);
  }

  async findAllAdmin(filters: BookingFiltersDto): Promise<{
    items: BookingEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const qb = this.bookingsRepository
      .createQueryBuilder('b')
      .orderBy('b.created_at', 'DESC');

    if (filters.status) {
      qb.andWhere('b.booking_status = :status', { status: filters.status });
    }
    if (filters.vendor_id) {
      qb.andWhere('b.vendor_id = :vid', { vid: filters.vendor_id });
    }
    if (filters.customer_id) {
      qb.andWhere('b.customer_id = :cid', { cid: filters.customer_id });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findById(
    bookingId: string,
    actor: BookingActor,
  ): Promise<BookingEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { booking_id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    this.assertCanRead(booking, actor);
    return this.stripOtpForActor(booking, actor);
  }

  async assignTechnician(
    bookingId: string,
    actor: BookingActor,
    technicianId: string,
    note?: string,
  ): Promise<BookingEntity> {
    if (actor.role !== Role.VENDOR && actor.role !== Role.ADMIN) {
      throw new ForbiddenException('Only vendors or admins can dispatch technicians');
    }

    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(BookingEntity, {
        where: { booking_id: bookingId },
      });
      if (!booking) throw new NotFoundException('Booking not found');

      if (actor.role === Role.VENDOR) {
        if (!actor.vendor_id) {
          throw new ForbiddenException('Vendor profile not linked to user');
        }
        if (booking.vendor_id !== actor.vendor_id) {
          throw new ForbiddenException('Booking not assigned to your vendor');
        }
      }

      if (
        booking.booking_status !== BookingStatus.ACCEPTED &&
        booking.booking_status !== BookingStatus.IN_PROGRESS
      ) {
        throw new BadRequestException(
          'Technicians can only be dispatched on accepted or in-progress bookings',
        );
      }

      if (
        booking.booking_status === BookingStatus.IN_PROGRESS &&
        booking.technician_id &&
        booking.technician_id !== technicianId
      ) {
        throw new ConflictException(
          'Cannot reassign technician once the job is in progress',
        );
      }

      const technician = await manager.findOne(TechnicianEntity, {
        where: { id: technicianId },
      });
      if (!technician) throw new NotFoundException('Technician not found');
      if (booking.vendor_id && technician.vendor_id !== booking.vendor_id) {
        throw new ForbiddenException(
          'Technician does not belong to the booking vendor',
        );
      }

      booking.technician_id = technician.id;
      const saved = await manager.save(booking);

      const eventRow = manager.create(BookingStatusEventEntity, {
        booking_id: saved.booking_id,
        from_status: saved.booking_status,
        to_status: saved.booking_status,
        event: 'assign',
        actor_user_id: actor.id,
        actor_role: actor.role,
        note: `technician:${technician.full_name}${note ? ' — ' + note : ''}`,
      });
      await manager.save(eventRow);

      return this.stripOtpForActor(saved, actor);
    });
  }

  async getEvents(
    bookingId: string,
    actor: BookingActor,
  ): Promise<BookingStatusEventEntity[]> {
    await this.findById(bookingId, actor);
    return this.eventsRepository.find({
      where: { booking_id: bookingId },
      order: { created_at: 'ASC' },
    });
  }

  async transition(
    bookingId: string,
    event: BookingEvent,
    actor: BookingActor,
    opts: TransitionOptions = {},
  ): Promise<BookingEntity> {
    return this.dataSource.transaction(async (manager) => {
      const booking = await manager.findOne(BookingEntity, {
        where: { booking_id: bookingId },
      });
      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Ownership checks (admin bypasses ownership, still respects lifecycle)
      if (actor.role !== Role.ADMIN) {
        if (actor.role === Role.CUSTOMER && booking.customer_id !== actor.id) {
          throw new ForbiddenException('Not your booking');
        }
        if (actor.role === Role.VENDOR) {
          if (!actor.vendor_id) {
            throw new ForbiddenException('Vendor profile not linked to user');
          }
          if (booking.vendor_id !== actor.vendor_id) {
            throw new ForbiddenException('Booking not assigned to your vendor');
          }
        }
        if (actor.role === Role.TECHNICIAN) {
          if (!actor.technician_id) {
            throw new ForbiddenException(
              'Technician profile not linked to user',
            );
          }
          if (booking.technician_id !== actor.technician_id) {
            throw new ForbiddenException('Booking not assigned to you');
          }
        }
      }

      if (!canTransition(booking.booking_status, event, actor.role)) {
        throw new BadRequestException(
          `Cannot ${event} booking in status "${booking.booking_status}" as ${actor.role}`,
        );
      }

      const next = applyTransition(booking.booking_status, event);
      if (!next) {
        throw new BadRequestException(`Invalid transition`);
      }

      const fromStatus = booking.booking_status;
      const now = new Date();

      // Apply side effects
      if (event === 'assign') {
        if (!opts.vendor_id) {
          throw new BadRequestException('vendor_id required for assign');
        }
        const vendor = await manager.findOne(VendorEntity, {
          where: { id: opts.vendor_id },
        });
        if (!vendor) {
          throw new NotFoundException('Vendor not found');
        }
        booking.vendor_id = vendor.id;
        booking.assigned_at = now;
      }
      if (event === 'accept') booking.accepted_at = now;
      if (event === 'reject') {
        booking.vendor_id = null;
        booking.technician_id = null;
        booking.assigned_at = null;
      }
      if (event === 'start') {
        if (!booking.technician_id) {
          throw new BadRequestException(
            'Assign a technician before starting the job',
          );
        }
        booking.started_at = now;
        booking.completion_otp = randomInt(0, 1_000_000)
          .toString()
          .padStart(6, '0');
        booking.completion_otp_expires_at = new Date(now.getTime() + OTP_TTL_MS);
      }
      if (event === 'complete') {
        if (actor.role === Role.TECHNICIAN) {
          if (!opts.otp) {
            throw new BadRequestException('OTP required to complete the job');
          }
          if (
            !booking.completion_otp ||
            booking.completion_otp !== opts.otp ||
            !booking.completion_otp_expires_at ||
            booking.completion_otp_expires_at.getTime() < now.getTime()
          ) {
            throw new BadRequestException('Invalid or expired OTP');
          }
        }
        booking.completed_at = now;
        booking.completion_otp = null;
        booking.completion_otp_expires_at = null;
      }
      if (event === 'cancel') booking.cancelled_at = now;

      booking.booking_status = next;
      const saved = await manager.save(booking);

      const eventRow = manager.create(BookingStatusEventEntity, {
        booking_id: saved.booking_id,
        from_status: fromStatus,
        to_status: next,
        event,
        actor_user_id: actor.id,
        actor_role: actor.role,
        note: opts.note ?? null,
      });
      await manager.save(eventRow);

      return this.stripOtpForActor(saved, actor);
    });
  }

  async createReview(
    bookingId: string,
    customerId: string,
    dto: CreateReviewDto,
  ): Promise<BookingReviewEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { booking_id: bookingId },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer_id !== customerId) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.booking_status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Reviews can only be left on completed bookings',
      );
    }
    if (!booking.vendor_id) {
      throw new BadRequestException('Booking has no associated vendor');
    }

    const existing = await this.reviewsRepository.findOne({
      where: { booking_id: bookingId },
    });
    if (existing) {
      throw new ConflictException('A review already exists for this booking');
    }

    const review = this.reviewsRepository.create({
      booking_id: bookingId,
      customer_id: customerId,
      vendor_id: booking.vendor_id,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });
    return this.reviewsRepository.save(review);
  }

  async getReview(
    bookingId: string,
    actor: BookingActor,
  ): Promise<BookingReviewEntity | null> {
    await this.findById(bookingId, actor);
    return this.reviewsRepository.findOne({ where: { booking_id: bookingId } });
  }

  private assertCanRead(booking: BookingEntity, actor: BookingActor): void {
    if (actor.role === Role.ADMIN) return;
    if (actor.role === Role.CUSTOMER && booking.customer_id === actor.id) {
      return;
    }
    if (
      actor.role === Role.VENDOR &&
      actor.vendor_id &&
      booking.vendor_id === actor.vendor_id
    ) {
      return;
    }
    if (
      actor.role === Role.TECHNICIAN &&
      actor.technician_id &&
      booking.technician_id === actor.technician_id
    ) {
      return;
    }
    throw new ForbiddenException('You do not have access to this booking');
  }

  /**
   * Completion OTP is only visible to the booking's customer while the job
   * is in progress. Everyone else sees null.
   */
  private stripOtpForActor(
    booking: BookingEntity,
    actor: BookingActor,
  ): BookingEntity {
    const canSeeOtp =
      actor.role === Role.CUSTOMER &&
      booking.customer_id === actor.id &&
      booking.booking_status === BookingStatus.IN_PROGRESS;
    if (canSeeOtp) return booking;
    return {
      ...booking,
      completion_otp: null,
      completion_otp_expires_at: null,
    } as BookingEntity;
  }
}

// Re-export helper used elsewhere
export { ALLOWED_TRANSITIONS };

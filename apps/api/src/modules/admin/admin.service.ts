import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  BookingEntity,
  BookingStatus,
  ServiceEntity,
  UserEntity,
  PartnerEntity,
  PartnerStatus,
  PayoutRequestEntity,
  PayoutStatus,
  UserStatus,
  Role,
} from '@/database/entities';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activePartners: number;
  totalUsers: number;
  avgRating: number;
  pendingApprovals: number;
}

interface FinanceSummary {
  totalRevenue: number;
  totalPayouts: number;
  net: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingsRepo: Repository<BookingEntity>,
    @InjectRepository(ServiceEntity)
    private readonly servicesRepo: Repository<ServiceEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(PartnerEntity)
    private readonly partnersRepo: Repository<PartnerEntity>,
    @InjectRepository(PayoutRequestEntity)
    private readonly payoutsRepo: Repository<PayoutRequestEntity>,
  ) {}

  // ─── Dashboard Stats ───────────────────────────────────────────────

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalBookings, totalUsers, activePartners, pendingApprovals] =
      await Promise.all([
        this.bookingsRepo.count(),
        this.usersRepo.count(),
        this.partnersRepo.count({
          where: { status: PartnerStatus.APPROVED },
        }),
        this.partnersRepo.count({
          where: { status: PartnerStatus.PENDING },
        }),
      ]);

    const revenueResult = await this.bookingsRepo
      .createQueryBuilder('b')
      .select('COALESCE(SUM(b.price), 0)', 'total')
      .where('b.booking_status = :status', {
        status: BookingStatus.COMPLETED,
      })
      .getRawOne<{ total: string }>();

    const ratingResult = await this.partnersRepo
      .createQueryBuilder('p')
      .select('COALESCE(AVG(p.rating), 0)', 'avg')
      .where('p.status = :status', { status: PartnerStatus.APPROVED })
      .getRawOne<{ avg: string }>();

    return {
      totalRevenue: parseFloat(revenueResult?.total ?? '0'),
      totalBookings,
      activePartners,
      totalUsers,
      avgRating: parseFloat(parseFloat(ratingResult?.avg ?? '0').toFixed(2)),
      pendingApprovals,
    };
  }

  // ─── Bookings ──────────────────────────────────────────────────────

  async getBookings(query: QueryBookingsDto): Promise<BookingEntity[]> {
    const qb = this.bookingsRepo
      .createQueryBuilder('b')
      .orderBy('b.created_at', 'DESC');

    if (query.status) {
      qb.andWhere('b.booking_status = :status', { status: query.status });
    }

    if (query.category) {
      qb.andWhere('b.category = :category', { category: query.category });
    }

    if (query.date_from && query.date_to) {
      qb.andWhere('b.created_at BETWEEN :from AND :to', {
        from: query.date_from,
        to: query.date_to,
      });
    } else if (query.date_from) {
      qb.andWhere('b.created_at >= :from', { from: query.date_from });
    } else if (query.date_to) {
      qb.andWhere('b.created_at <= :to', { to: query.date_to });
    }

    if (query.search) {
      qb.andWhere('b.customer_name ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    return qb.getMany();
  }

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
  ): Promise<BookingEntity> {
    const booking = await this.bookingsRepo.findOne({
      where: { booking_id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.booking_status = status;
    return this.bookingsRepo.save(booking);
  }

  // ─── Services ──────────────────────────────────────────────────────

  async createService(dto: CreateServiceDto): Promise<ServiceEntity> {
    const service = this.servicesRepo.create(dto);
    return this.servicesRepo.save(service);
  }

  async updateService(
    id: number,
    dto: UpdateServiceDto,
  ): Promise<ServiceEntity> {
    const service = await this.servicesRepo.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    Object.assign(service, dto);
    return this.servicesRepo.save(service);
  }

  async deleteService(id: number): Promise<void> {
    const service = await this.servicesRepo.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    service.is_active = false;
    await this.servicesRepo.save(service);
  }

  // ─── Users ─────────────────────────────────────────────────────────

  async getUsers(role?: Role): Promise<UserEntity[]> {
    const where = role ? { role } : {};
    return this.usersRepo.find({
      where,
      order: { created_at: 'DESC' },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'avatar',
        'status',
        'created_at',
        'updated_at',
      ],
    });
  }

  async updateUserStatus(
    userId: string,
    status: UserStatus,
  ): Promise<UserEntity> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === Role.ADMIN) {
      throw new BadRequestException('Cannot change status of an admin user');
    }

    user.status = status;
    return this.usersRepo.save(user);
  }

  // ─── Partners ──────────────────────────────────────────────────────

  async getPartners(): Promise<PartnerEntity[]> {
    return this.partnersRepo.find({
      relations: ['user'],
      order: { joined_at: 'DESC' },
    });
  }

  async updatePartnerStatus(
    partnerId: string,
    status: PartnerStatus,
  ): Promise<PartnerEntity> {
    const partner = await this.partnersRepo.findOne({
      where: { id: partnerId },
      relations: ['user'],
    });

    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    partner.status = status;
    return this.partnersRepo.save(partner);
  }

  // ─── Finance ───────────────────────────────────────────────────────

  async getFinanceSummary(): Promise<FinanceSummary> {
    const revenueResult = await this.bookingsRepo
      .createQueryBuilder('b')
      .select('COALESCE(SUM(b.price), 0)', 'total')
      .where('b.booking_status = :status', {
        status: BookingStatus.COMPLETED,
      })
      .getRawOne<{ total: string }>();

    const payoutsResult = await this.payoutsRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.amount), 0)', 'total')
      .where('p.status = :status', { status: PayoutStatus.PROCESSED })
      .getRawOne<{ total: string }>();

    const totalRevenue = parseFloat(revenueResult?.total ?? '0');
    const totalPayouts = parseFloat(payoutsResult?.total ?? '0');

    return {
      totalRevenue,
      totalPayouts,
      net: totalRevenue - totalPayouts,
    };
  }

  async getPayoutRequests(): Promise<PayoutRequestEntity[]> {
    return this.payoutsRepo.find({
      relations: ['partner'],
      order: { requested_at: 'DESC' },
    });
  }

  async processPayout(
    payoutId: string,
    status: PayoutStatus.PROCESSED | PayoutStatus.REJECTED,
  ): Promise<PayoutRequestEntity> {
    const payout = await this.payoutsRepo.findOne({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new NotFoundException('Payout request not found');
    }

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException(
        `Payout has already been ${payout.status}`,
      );
    }

    payout.status = status;
    payout.processed_at = new Date();
    return this.payoutsRepo.save(payout);
  }
}

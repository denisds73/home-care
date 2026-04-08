import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BookingEntity,
  BookingStatus,
  ServiceEntity,
  UserEntity,
  VendorEntity,
  VendorStatus,
  UserStatus,
  Role,
} from '@/database/entities';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeVendors: number;
  totalUsers: number;
  pendingVendorApprovals: number;
}

interface FinanceSummary {
  totalRevenue: number;
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
    @InjectRepository(VendorEntity)
    private readonly vendorsRepo: Repository<VendorEntity>,
  ) {}

  // ─── Dashboard Stats ───────────────────────────────────────────────

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalBookings, totalUsers, activeVendors, pendingVendorApprovals] =
      await Promise.all([
        this.bookingsRepo.count(),
        this.usersRepo.count(),
        this.vendorsRepo.count({ where: { status: VendorStatus.ACTIVE } }),
        this.vendorsRepo.count({ where: { status: VendorStatus.PENDING } }),
      ]);

    const revenueResult = await this.bookingsRepo
      .createQueryBuilder('b')
      .select('COALESCE(SUM(b.price), 0)', 'total')
      .where('b.booking_status = :status', {
        status: BookingStatus.COMPLETED,
      })
      .getRawOne<{ total: string }>();

    return {
      totalRevenue: parseFloat(revenueResult?.total ?? '0'),
      totalBookings,
      activeVendors,
      totalUsers,
      pendingVendorApprovals,
    };
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
        'vendor_id',
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

  // ─── Finance ───────────────────────────────────────────────────────

  async getFinanceSummary(): Promise<FinanceSummary> {
    const revenueResult = await this.bookingsRepo
      .createQueryBuilder('b')
      .select('COALESCE(SUM(b.price), 0)', 'total')
      .where('b.booking_status = :status', {
        status: BookingStatus.COMPLETED,
      })
      .getRawOne<{ total: string }>();

    return {
      totalRevenue: parseFloat(revenueResult?.total ?? '0'),
    };
  }
}

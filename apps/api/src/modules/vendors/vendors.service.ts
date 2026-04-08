import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import {
  VendorEntity,
  VendorStatus,
  CategoryEntity,
} from '@/database/entities';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorMeDto } from './dto/update-vendor-me.dto';
import { QueryVendorsDto } from './dto/query-vendors.dto';

export interface PaginatedVendors {
  items: VendorEntity[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly vendorsRepo: Repository<VendorEntity>,
    @InjectRepository(CategoryEntity)
    private readonly categoriesRepo: Repository<CategoryEntity>,
  ) {}

  async create(dto: CreateVendorDto, adminUserId?: string): Promise<VendorEntity> {
    await this.assertUniqueEmail(dto.email);
    await this.assertUniqueGst(dto.gst_number);

    const categories = await this.loadCategories(dto.category_ids);

    const vendor = this.vendorsRepo.create({
      company_name: dto.company_name,
      contact_number: dto.contact_number,
      email: dto.email,
      city: dto.city,
      pin_codes: dto.pin_codes,
      gst_number: dto.gst_number,
      gst_verified: dto.gst_verified ?? false,
      notes: dto.notes ?? null,
      categories,
      status: VendorStatus.PENDING,
      onboarded_by_id: adminUserId ?? null,
    });

    return this.vendorsRepo.save(vendor);
  }

  async findAll(query: QueryVendorsDto): Promise<PaginatedVendors> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.vendorsRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.categories', 'c')
      .orderBy('v.created_at', 'DESC');

    if (query.status) {
      qb.andWhere('v.status = :status', { status: query.status });
    }
    if (query.city) {
      qb.andWhere('v.city ILIKE :city', { city: `%${query.city}%` });
    }
    if (query.search) {
      qb.andWhere(
        '(v.company_name ILIKE :s OR v.email ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string): Promise<VendorEntity> {
    const vendor = await this.vendorsRepo.findOne({
      where: { id },
      relations: ['categories', 'onboarded_by'],
    });
    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }
    return vendor;
  }

  async update(id: string, dto: UpdateVendorDto): Promise<VendorEntity> {
    const vendor = await this.findOne(id);

    if (dto.email && dto.email !== vendor.email) {
      await this.assertUniqueEmail(dto.email, id);
      vendor.email = dto.email;
    }
    if (dto.gst_number && dto.gst_number !== vendor.gst_number) {
      await this.assertUniqueGst(dto.gst_number, id);
      vendor.gst_number = dto.gst_number;
    }

    if (dto.company_name !== undefined) vendor.company_name = dto.company_name;
    if (dto.contact_number !== undefined) vendor.contact_number = dto.contact_number;
    if (dto.city !== undefined) vendor.city = dto.city;
    if (dto.pin_codes !== undefined) vendor.pin_codes = dto.pin_codes;
    if (dto.gst_verified !== undefined) vendor.gst_verified = dto.gst_verified;
    if (dto.notes !== undefined) vendor.notes = dto.notes;

    if (dto.category_ids !== undefined) {
      vendor.categories = await this.loadCategories(dto.category_ids);
    }

    return this.vendorsRepo.save(vendor);
  }

  async updateStatus(id: string, status: VendorStatus): Promise<VendorEntity> {
    const vendor = await this.findOne(id);
    vendor.status = status;
    return this.vendorsRepo.save(vendor);
  }

  async findMe(vendorId: string): Promise<VendorEntity> {
    return this.findOne(vendorId);
  }

  async updateMe(
    vendorId: string,
    dto: UpdateVendorMeDto,
  ): Promise<VendorEntity> {
    const vendor = await this.findOne(vendorId);
    if (dto.contact_number !== undefined) {
      vendor.contact_number = dto.contact_number;
    }
    if (dto.pin_codes !== undefined) {
      vendor.pin_codes = dto.pin_codes;
    }
    return this.vendorsRepo.save(vendor);
  }

  async remove(id: string): Promise<void> {
    const result = await this.vendorsRepo.delete(id);
    if (!result.affected) {
      throw new NotFoundException('Vendor not found');
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────

  private async assertUniqueEmail(email: string, excludeId?: string) {
    const where = excludeId ? { email, id: Not(excludeId) } : { email };
    const existing = await this.vendorsRepo.findOne({ where });
    if (existing) {
      throw new ConflictException('A vendor with this email already exists');
    }
  }

  private async assertUniqueGst(gst: string, excludeId?: string) {
    const where = excludeId ? { gst_number: gst, id: Not(excludeId) } : { gst_number: gst };
    const existing = await this.vendorsRepo.findOne({ where });
    if (existing) {
      throw new ConflictException('A vendor with this GST number already exists');
    }
  }

  private async loadCategories(ids: string[]): Promise<CategoryEntity[]> {
    const categories = await this.categoriesRepo.find({ where: { id: In(ids) } });
    if (categories.length !== ids.length) {
      throw new BadRequestException('One or more category IDs are invalid');
    }
    return categories;
  }
}

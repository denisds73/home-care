import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  Role,
  TechnicianEntity,
  TechnicianStatus,
  UserEntity,
  UserStatus,
} from '@/database/entities';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class TechniciansService {
  constructor(
    @InjectRepository(TechnicianEntity)
    private readonly techniciansRepository: Repository<TechnicianEntity>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    vendorId: string,
    dto: CreateTechnicianDto,
  ): Promise<TechnicianEntity> {
    if (!vendorId) {
      throw new ForbiddenException('Vendor profile not linked to user');
    }

    const emailTaken = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (emailTaken) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    return this.dataSource.transaction(async (manager) => {
      const tech = manager.create(TechnicianEntity, {
        vendor_id: vendorId,
        full_name: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        skills: dto.skills ?? [],
        status: dto.status ?? TechnicianStatus.ACTIVE,
      });
      const savedTech = await manager.save(tech);

      const user = manager.create(UserEntity, {
        name: dto.full_name,
        email: dto.email,
        password_hash: passwordHash,
        phone: dto.phone,
        role: Role.TECHNICIAN,
        status: UserStatus.ACTIVE,
        vendor_id: vendorId,
        technician_id: savedTech.id,
      });
      await manager.save(user);

      return savedTech;
    });
  }

  listByVendor(vendorId: string): Promise<TechnicianEntity[]> {
    if (!vendorId) return Promise.resolve([]);
    return this.techniciansRepository.find({
      where: { vendor_id: vendorId },
      order: { created_at: 'DESC' },
    });
  }

  async findOneForVendor(
    vendorId: string,
    id: string,
  ): Promise<TechnicianEntity> {
    const tech = await this.techniciansRepository.findOne({ where: { id } });
    if (!tech || tech.vendor_id !== vendorId) {
      throw new NotFoundException('Technician not found');
    }
    return tech;
  }

  async update(
    vendorId: string,
    id: string,
    dto: UpdateTechnicianDto,
  ): Promise<TechnicianEntity> {
    const tech = await this.findOneForVendor(vendorId, id);

    if (dto.email && dto.email !== tech.email) {
      const clash = await this.usersRepository.findOne({
        where: { email: dto.email },
      });
      if (clash && clash.technician_id !== tech.id) {
        throw new ConflictException('Email already in use');
      }
    }

    return this.dataSource.transaction(async (manager) => {
      if (dto.full_name !== undefined) tech.full_name = dto.full_name;
      if (dto.phone !== undefined) tech.phone = dto.phone;
      if (dto.email !== undefined) tech.email = dto.email;
      if (dto.skills !== undefined) tech.skills = dto.skills;
      if (dto.status !== undefined) tech.status = dto.status;
      const saved = await manager.save(tech);

      if (dto.email !== undefined || dto.full_name !== undefined || dto.phone !== undefined) {
        const user = await manager.findOne(UserEntity, {
          where: { technician_id: tech.id },
        });
        if (user) {
          if (dto.email !== undefined) user.email = dto.email;
          if (dto.full_name !== undefined) user.name = dto.full_name;
          if (dto.phone !== undefined) user.phone = dto.phone;
          await manager.save(user);
        }
      }
      return saved;
    });
  }

  async updateStatus(
    vendorId: string,
    id: string,
    status: TechnicianStatus,
  ): Promise<TechnicianEntity> {
    const tech = await this.findOneForVendor(vendorId, id);
    tech.status = status;
    return this.techniciansRepository.save(tech);
  }

  async remove(vendorId: string, id: string): Promise<void> {
    const tech = await this.findOneForVendor(vendorId, id);
    await this.dataSource.transaction(async (manager) => {
      await manager.delete(UserEntity, { technician_id: tech.id });
      await manager.delete(TechnicianEntity, { id: tech.id });
    });
  }

  async findMeByUserId(userId: string): Promise<TechnicianEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!user.technician_id) {
      throw new BadRequestException('User is not linked to a technician');
    }
    const tech = await this.techniciansRepository.findOne({
      where: { id: user.technician_id },
      relations: ['vendor'],
    });
    if (!tech) throw new NotFoundException('Technician not found');
    return tech;
  }
}

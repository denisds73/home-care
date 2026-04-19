import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceEntity } from '@/database/entities';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly serviceRepo: Repository<ServiceEntity>,
  ) {}

  async findAll(filters?: {
    category?: string;
    search?: string;
  }): Promise<ServiceEntity[]> {
    const qb = this.serviceRepo
      .createQueryBuilder('service')
      .where('service.is_active = :isActive', { isActive: true });

    if (filters?.category) {
      qb.andWhere('service.category = :category', { category: filters.category });
    }

    const term = filters?.search?.trim();
    if (term) {
      qb.andWhere(
        '(service.service_name ILIKE :searchLike OR service.description ILIKE :searchLike)',
        { searchLike: `%${term}%` },
      );
    }

    qb.orderBy('service.service_name', 'ASC');

    return qb.getMany();
  }

  async search(query: string): Promise<ServiceEntity[]> {
    return this.serviceRepo
      .createQueryBuilder('service')
      .where('service.is_active = :isActive', { isActive: true })
      .andWhere(
        '(service.service_name ILIKE :q OR service.description ILIKE :q)',
        { q: `%${query}%` },
      )
      .orderBy('service.service_name', 'ASC')
      .getMany();
  }

  async findById(id: number): Promise<ServiceEntity> {
    const service = await this.serviceRepo.findOne({ where: { id } });

    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }

    return service;
  }
}

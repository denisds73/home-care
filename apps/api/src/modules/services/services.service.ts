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

  async findAll(category?: string): Promise<ServiceEntity[]> {
    const qb = this.serviceRepo
      .createQueryBuilder('service')
      .where('service.is_active = :isActive', { isActive: true });

    if (category) {
      qb.andWhere('service.category = :category', { category });
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

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianEntity, UserEntity } from '@/database/entities';
import { TechniciansService } from './technicians.service';
import { VendorTechniciansController } from './vendor-technicians.controller';
import { TechnicianMeController } from './technician-me.controller';
import { AdminTechniciansController } from './admin-technicians.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TechnicianEntity, UserEntity])],
  controllers: [
    VendorTechniciansController,
    TechnicianMeController,
    AdminTechniciansController,
  ],
  providers: [TechniciansService],
  exports: [TechniciansService],
})
export class TechniciansModule {}

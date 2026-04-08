import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianEntity, UserEntity } from '@/database/entities';
import { TechniciansService } from './technicians.service';
import { VendorTechniciansController } from './vendor-technicians.controller';
import { TechnicianMeController } from './technician-me.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TechnicianEntity, UserEntity])],
  controllers: [VendorTechniciansController, TechnicianMeController],
  providers: [TechniciansService],
  exports: [TechniciansService],
})
export class TechniciansModule {}

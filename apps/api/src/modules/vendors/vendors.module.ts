import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorEntity, CategoryEntity } from '@/database/entities';
import { VendorsController } from './vendors.controller';
import { VendorMeController } from './vendor-me.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [TypeOrmModule.forFeature([VendorEntity, CategoryEntity])],
  controllers: [VendorsController, VendorMeController],
  providers: [VendorsService],
})
export class VendorsModule {}

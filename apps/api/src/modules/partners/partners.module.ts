import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PartnerEntity,
  JobEntity,
  UserEntity,
} from '@/database/entities';
import { PartnersController } from './partners.controller';
import { PartnersService } from './partners.service';

@Module({
  imports: [TypeOrmModule.forFeature([PartnerEntity, JobEntity, UserEntity])],
  controllers: [PartnersController],
  providers: [PartnersService],
  exports: [PartnersService],
})
export class PartnersModule {}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { CurrentUser, Roles } from '@/common/decorators';
import { Role, UserEntity } from '@/database/entities';
import { TechniciansService } from './technicians.service';

@ApiTags('technician-me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TECHNICIAN)
@Controller('technician/me')
export class TechnicianMeController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get()
  @ApiOperation({ summary: 'Get the profile of the current technician' })
  me(@CurrentUser() user: UserEntity) {
    return this.techniciansService.findMeByUserId(user.id);
  }
}

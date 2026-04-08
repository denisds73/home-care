import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles } from '@/common/decorators';
import { Role } from '@/database/entities';
import { TechniciansService } from './technicians.service';

@ApiTags('admin-technicians')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminTechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Get('vendors/:vendorId/technicians')
  @ApiOperation({
    summary: 'List technicians for any vendor (admin only)',
  })
  listByVendor(@Param('vendorId', ParseUUIDPipe) vendorId: string) {
    return this.techniciansService.listByVendor(vendorId);
  }
}

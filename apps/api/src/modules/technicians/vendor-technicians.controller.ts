import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { CurrentUser, Roles } from '@/common/decorators';
import { Role, UserEntity } from '@/database/entities';
import { TechniciansService } from './technicians.service';
import { CreateTechnicianDto } from './dto/create-technician.dto';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { UpdateTechnicianStatusDto } from './dto/update-technician-status.dto';

@ApiTags('vendor-technicians')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
@Controller('vendor/technicians')
export class VendorTechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  private ensureVendorId(user: UserEntity): string {
    if (!user.vendor_id) {
      throw new ForbiddenException('Vendor profile not linked to user');
    }
    return user.vendor_id;
  }

  @Get()
  @ApiOperation({ summary: 'List technicians for the current vendor' })
  list(@CurrentUser() user: UserEntity) {
    return this.techniciansService.listByVendor(this.ensureVendorId(user));
  }

  @Post()
  @ApiOperation({ summary: 'Create a technician under the current vendor' })
  create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateTechnicianDto,
  ) {
    return this.techniciansService.create(this.ensureVendorId(user), dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a technician by id (scoped to current vendor)' })
  findOne(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.techniciansService.findOneForVendor(
      this.ensureVendorId(user),
      id,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a technician (scoped to current vendor)' })
  update(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.techniciansService.update(this.ensureVendorId(user), id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update a technician status' })
  updateStatus(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTechnicianStatusDto,
  ) {
    return this.techniciansService.updateStatus(
      this.ensureVendorId(user),
      id,
      dto.status,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a technician (scoped to current vendor)' })
  async remove(
    @CurrentUser() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.techniciansService.remove(this.ensureVendorId(user), id);
    return { success: true };
  }
}

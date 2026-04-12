import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles } from '@/common/decorators';
import { Role } from '@/database/entities';
import { AdminService } from './admin.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard KPI stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ─── Services ──────────────────────────────────────────────────────

  @Post('services')
  @ApiOperation({ summary: 'Create a new service' })
  async createService(@Body() dto: CreateServiceDto) {
    return this.adminService.createService(dto);
  }

  @Put('services/:id')
  @ApiOperation({ summary: 'Update an existing service' })
  async updateService(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.adminService.updateService(id, dto);
  }

  @Delete('services/:id')
  @ApiOperation({ summary: 'Soft-delete a service (set is_active=false)' })
  async deleteService(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteService(id);
    return { success: true };
  }

  // ─── Users ─────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users with optional role filter' })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  async getUsers(@Query('role') role?: Role) {
    return this.adminService.getUsers(role);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (active/suspended)' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, dto.status);
  }

  // ─── Finance ───────────────────────────────────────────────────────

  @Get('finance')
  @ApiOperation({ summary: 'Get revenue summary' })
  async getFinanceSummary() {
    return this.adminService.getFinanceSummary();
  }

  // ─── Offers ────────────────────────────────────────────────────────

  @Get('offers')
  @ApiOperation({ summary: 'List all offers (including inactive)' })
  async getOffers() {
    return this.adminService.getOffers();
  }

  @Post('offers')
  @ApiOperation({ summary: 'Create a new offer' })
  async createOffer(@Body() dto: CreateOfferDto) {
    return this.adminService.createOffer(dto);
  }

  @Put('offers/:id')
  @ApiOperation({ summary: 'Update an existing offer' })
  async updateOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOfferDto,
  ) {
    return this.adminService.updateOffer(id, dto);
  }

  @Delete('offers/:id')
  @ApiOperation({ summary: 'Delete an offer permanently' })
  async deleteOffer(@Param('id', ParseUUIDPipe) id: string) {
    await this.adminService.deleteOffer(id);
    return { success: true };
  }
}

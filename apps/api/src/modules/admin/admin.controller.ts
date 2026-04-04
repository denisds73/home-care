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
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { QueryBookingsDto } from './dto/query-bookings.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdatePartnerStatusDto } from './dto/update-partner-status.dto';
import { ProcessPayoutDto } from './dto/process-payout.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ─── Dashboard ─────────────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard KPI stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ─── Bookings ──────────────────────────────────────────────────────

  @Get('bookings')
  @ApiOperation({ summary: 'List all bookings with optional filters' })
  async getBookings(@Query() query: QueryBookingsDto) {
    return this.adminService.getBookings(query);
  }

  @Patch('bookings/:id/status')
  @ApiOperation({ summary: 'Update booking status' })
  async updateBookingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(id, dto.status);
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

  // ─── Partners ──────────────────────────────────────────────────────

  @Get('partners')
  @ApiOperation({ summary: 'List all partners with user details' })
  async getPartners() {
    return this.adminService.getPartners();
  }

  @Patch('partners/:id/status')
  @ApiOperation({ summary: 'Approve or suspend a partner' })
  async updatePartnerStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerStatusDto,
  ) {
    return this.adminService.updatePartnerStatus(id, dto.status);
  }

  // ─── Finance ───────────────────────────────────────────────────────

  @Get('finance')
  @ApiOperation({ summary: 'Get revenue summary' })
  async getFinanceSummary() {
    return this.adminService.getFinanceSummary();
  }

  @Get('finance/payouts')
  @ApiOperation({ summary: 'List all payout requests' })
  async getPayoutRequests() {
    return this.adminService.getPayoutRequests();
  }

  @Patch('finance/payouts/:id')
  @ApiOperation({ summary: 'Process or reject a payout request' })
  async processPayout(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessPayoutDto,
  ) {
    return this.adminService.processPayout(id, dto.status);
  }
}

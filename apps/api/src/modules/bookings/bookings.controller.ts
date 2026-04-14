import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { Role, UserEntity, BookingStatus } from '@/database/entities';
import { BookingsService, BookingActor } from './bookings.service';
import { DelayService } from './delay.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { AssignBookingDto } from './dto/assign-booking.dto';
import { AssignTechnicianDto } from './dto/assign-technician.dto';
import { TransitionNoteDto } from './dto/transition-note.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingFiltersDto } from './dto/booking-filters.dto';
import { ReportDelayDto } from './dto/report-delay.dto';
import { RespondDelayDto } from './dto/respond-delay.dto';
import { RescheduleService } from './reschedule.service';
import { ProposeRescheduleDto } from './dto/propose-reschedule.dto';
import { RespondRescheduleDto } from './dto/respond-reschedule.dto';

function toActor(user: UserEntity): BookingActor {
  return {
    id: user.id,
    role: user.role,
    vendor_id: user.vendor_id ?? null,
    technician_id: user.technician_id ?? null,
  };
}

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly delayService: DelayService,
    private readonly rescheduleService: RescheduleService,
  ) {}

  @Post('bookings')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Create a new booking' })
  async create(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(user.id, dto);
  }

  @Get('bookings/me')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Get bookings for current customer' })
  async getMyBookings(@CurrentUser() user: UserEntity) {
    return this.bookingsService.findByCustomer(user.id);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.findById(id, toActor(user));
  }

  @Get('bookings/:id/events')
  @ApiOperation({ summary: 'Get booking status event history' })
  async getEvents(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.getEvents(id, toActor(user));
  }

  @Post('bookings/:id/assign')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign a booking to a vendor (admin only)' })
  async assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignBookingDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.transition(id, 'assign', toActor(user), {
      vendor_id: dto.vendor_id,
      note: dto.note,
    });
  }

  @Post('bookings/:id/accept')
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiOperation({ summary: 'Accept a booking' })
  async accept(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionNoteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.transition(id, 'accept', toActor(user), {
      note: dto.note,
    });
  }

  @Post('bookings/:id/reject')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'Reject an assigned booking' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionNoteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.transition(id, 'reject', toActor(user), {
      note: dto.note,
    });
  }

  @Post('bookings/:id/start')
  @Roles(Role.VENDOR, Role.TECHNICIAN, Role.ADMIN)
  @ApiOperation({ summary: 'Start a booking' })
  async start(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionNoteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.transition(id, 'start', toActor(user), {
      note: dto.note,
    });
  }

  @Post('bookings/:id/complete')
  @Roles(Role.VENDOR, Role.TECHNICIAN, Role.ADMIN)
  @ApiOperation({ summary: 'Complete a booking' })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionNoteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.transition(id, 'complete', toActor(user), {
      note: dto.note,
      otp: dto.otp,
    });
  }

  @Post('bookings/:id/assign-technician')
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiOperation({ summary: 'Dispatch a technician to a booking' })
  async assignTechnician(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTechnicianDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.assignTechnician(
      id,
      toActor(user),
      dto.technician_id,
      dto.note,
    );
  }

  @Get('technician/bookings')
  @Roles(Role.TECHNICIAN)
  @ApiOperation({ summary: 'List bookings assigned to current technician' })
  async getTechnicianBookings(
    @CurrentUser() user: UserEntity,
    @Query('status') status?: BookingStatus,
  ) {
    if (!user.technician_id) {
      return [];
    }
    return this.bookingsService.findByTechnician(user.technician_id, { status });
  }

  @Post('bookings/:id/cancel')
  @Roles(Role.CUSTOMER, Role.ADMIN)
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionNoteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.transition(id, 'cancel', toActor(user), {
      note: dto.note,
    });
  }

  @Get('vendor/bookings')
  @Roles(Role.VENDOR)
  @ApiOperation({ summary: 'List bookings assigned to current vendor' })
  async getVendorBookings(
    @CurrentUser() user: UserEntity,
    @Query('status') status?: BookingStatus,
  ) {
    if (!user.vendor_id) {
      return [];
    }
    return this.bookingsService.findByVendor(user.vendor_id, { status });
  }

  @Get('admin/bookings')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all bookings (admin)' })
  async getAdminBookings(@Query() filters: BookingFiltersDto) {
    return this.bookingsService.findAllAdmin(filters);
  }

  @Post('bookings/:id/review')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Create a review for a completed booking' })
  async createReview(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.createReview(id, user.id, dto);
  }

  @Get('bookings/:id/review')
  @ApiOperation({ summary: 'Fetch the review for a booking' })
  async getReview(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.getReview(id, toActor(user));
  }

  // ─── Delay Communication ───────────────────────────

  @Post('bookings/:id/delay')
  @Roles(Role.TECHNICIAN, Role.VENDOR, Role.ADMIN)
  @ApiOperation({ summary: 'Report a delay on a booking' })
  async reportDelay(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
    @Body() dto: ReportDelayDto,
  ) {
    return this.delayService.reportDelay(id, toActor(user), dto);
  }

  @Post('bookings/:id/delay/:delayId/respond')
  @Roles(Role.CUSTOMER)
  @ApiOperation({ summary: 'Respond to a delay event' })
  async respondToDelay(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('delayId', ParseUUIDPipe) delayId: string,
    @CurrentUser() user: UserEntity,
    @Body() dto: RespondDelayDto,
  ) {
    return this.delayService.respondToDelay(id, delayId, toActor(user), dto);
  }

  @Get('bookings/:id/delay-events')
  @ApiOperation({ summary: 'Get all delay events for a booking' })
  async getDelayEvents(@Param('id', ParseUUIDPipe) id: string) {
    return this.delayService.getDelayEvents(id);
  }

  // ─── Reschedule Communication ──────────────────────

  @Post('bookings/:id/reschedule')
  @ApiOperation({ summary: 'Propose a reschedule for a booking' })
  async proposeReschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
    @Body() dto: ProposeRescheduleDto,
  ) {
    return this.rescheduleService.propose(id, toActor(user), dto);
  }

  @Post('bookings/:id/reschedule/:rescheduleId/respond')
  @ApiOperation({ summary: 'Respond to a reschedule request' })
  async respondToReschedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('rescheduleId', ParseUUIDPipe) rescheduleId: string,
    @CurrentUser() user: UserEntity,
    @Body() dto: RespondRescheduleDto,
  ) {
    return this.rescheduleService.respond(id, rescheduleId, toActor(user), dto);
  }

  @Get('bookings/:id/reschedule-requests')
  @ApiOperation({ summary: 'Get all reschedule requests for a booking' })
  async getRescheduleRequests(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.rescheduleService.getRequests(id);
  }
}

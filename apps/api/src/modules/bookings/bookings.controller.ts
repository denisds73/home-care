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
import { CreateBookingDto } from './dto/create-booking.dto';
import { AssignBookingDto } from './dto/assign-booking.dto';
import { TransitionNoteDto } from './dto/transition-note.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingFiltersDto } from './dto/booking-filters.dto';

function toActor(user: UserEntity): BookingActor {
  return { id: user.id, role: user.role, vendor_id: user.vendor_id ?? null };
}

@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

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
  @Roles(Role.VENDOR, Role.ADMIN)
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
  @Roles(Role.VENDOR, Role.ADMIN)
  @ApiOperation({ summary: 'Complete a booking' })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionNoteDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.bookingsService.transition(id, 'complete', toActor(user), {
      note: dto.note,
    });
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
}

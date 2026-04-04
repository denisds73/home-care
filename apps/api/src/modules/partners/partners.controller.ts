import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { Role } from '@/database/entities';
import { PartnersService } from './partners.service';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { ToggleAvailabilityDto } from './dto/toggle-availability.dto';

@ApiTags('partners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARTNER)
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own partner profile' })
  @ApiOkResponse({ description: 'Partner profile with user details' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.partnersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update partner profile (skills, service area)' })
  @ApiOkResponse({ description: 'Updated partner profile' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnersService.updateProfile(userId, dto);
  }

  @Patch('me/availability')
  @ApiOperation({ summary: 'Toggle online/offline availability' })
  @ApiOkResponse({ description: 'Updated partner profile' })
  toggleAvailability(
    @CurrentUser('id') userId: string,
    @Body() dto: ToggleAvailabilityDto,
  ) {
    return this.partnersService.toggleAvailability(userId, dto.is_online);
  }

  @Get('me/jobs')
  @ApiOperation({ summary: 'List all jobs assigned to this partner' })
  @ApiOkResponse({ description: 'List of jobs' })
  getJobs(@CurrentUser('id') userId: string) {
    return this.partnersService.getJobs(userId);
  }

  @Patch('me/jobs/:id/status')
  @ApiOperation({ summary: 'Update job status with state machine validation' })
  @ApiOkResponse({ description: 'Updated job' })
  updateJobStatus(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) jobId: string,
    @Body() dto: UpdateJobStatusDto,
  ) {
    return this.partnersService.updateJobStatus(userId, jobId, dto.status);
  }

  @Get('me/earnings')
  @ApiOperation({ summary: 'Get earnings summary' })
  @ApiOkResponse({ description: 'Earnings summary with totals and averages' })
  getEarnings(@CurrentUser('id') userId: string) {
    return this.partnersService.getEarnings(userId);
  }

  @Get('me/schedule')
  @ApiOperation({ summary: 'Get jobs scheduled for this week' })
  @ApiOkResponse({ description: 'List of scheduled jobs for the current week' })
  getSchedule(@CurrentUser('id') userId: string) {
    return this.partnersService.getSchedule(userId);
  }

  @Patch('me/schedule')
  @ApiOperation({ summary: 'Update working hours (placeholder)' })
  @ApiOkResponse({ description: 'Success acknowledgement' })
  updateSchedule(@CurrentUser('id') _userId: string) {
    return { message: 'Working hours updated successfully' };
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { Role } from '@/database/entities';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { QueryVendorsDto } from './dto/query-vendors.dto';

interface JwtUser {
  id: string;
  role: Role;
}

@ApiTags('admin-vendors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  @ApiOperation({ summary: 'Onboard a new vendor' })
  async create(
    @Body() dto: CreateVendorDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.vendorsService.create(dto, user?.id);
  }

  @Get()
  @ApiOperation({ summary: 'List vendors with filters + pagination' })
  async findAll(@Query() query: QueryVendorsDto) {
    return this.vendorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a vendor by id' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.vendorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVendorDto,
  ) {
    return this.vendorsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update vendor status' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVendorStatusDto,
  ) {
    return this.vendorsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a vendor' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.vendorsService.remove(id);
    return { success: true };
  }
}

import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { Roles, CurrentUser } from '@/common/decorators';
import { Role, UserEntity } from '@/database/entities';
import { VendorsService } from './vendors.service';
import { UpdateVendorMeDto } from './dto/update-vendor-me.dto';

@ApiTags('vendor-me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
@Controller('vendor')
export class VendorMeController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current vendor profile' })
  async getMe(@CurrentUser() user: UserEntity) {
    if (!user.vendor_id) {
      throw new ForbiddenException('No vendor profile linked to user');
    }
    return this.vendorsService.findMe(user.vendor_id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current vendor profile (limited fields)' })
  async updateMe(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateVendorMeDto,
  ) {
    if (!user.vendor_id) {
      throw new ForbiddenException('No vendor profile linked to user');
    }
    return this.vendorsService.updateMe(user.vendor_id, dto);
  }
}

import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { CurrentUser, Roles } from '@/common/decorators';
import { Role } from '@/database/entities';
import { WalletService } from './wallet.service';
import { RequestPayoutDto } from './dto/request-payout.dto';

@ApiTags('Wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current wallet balance for the authenticated user' })
  async getBalance(@CurrentUser('id') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List wallet transactions for the authenticated user' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTransactions(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.getTransactions(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTNER)
  @ApiOperation({ summary: 'Request a payout (partner only)' })
  async requestPayout(
    @CurrentUser('id') userId: string,
    @Body() dto: RequestPayoutDto,
  ) {
    return this.walletService.requestPayout(userId, dto);
  }
}

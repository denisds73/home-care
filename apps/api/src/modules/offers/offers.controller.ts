import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { OfferEntity } from '@/database/entities';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active offers (public)' })
  async findActive(): Promise<OfferEntity[]> {
    return this.offersService.findActive();
  }
}

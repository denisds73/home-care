import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { QueryServicesDto } from './dto/query-services.dto';
import { SearchServicesDto } from './dto/search-services.dto';
import { ServiceEntity } from '@/database/entities';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({
    summary:
      'Get all active services, optionally filtered by category and/or search text',
  })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(@Query() query: QueryServicesDto): Promise<ServiceEntity[]> {
    return this.servicesService.findAll({
      category: query.category,
      search: query.search,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search services by name or description' })
  @ApiQuery({ name: 'q', required: true, type: String })
  async search(@Query() query: SearchServicesDto): Promise<ServiceEntity[]> {
    return this.servicesService.search(query.q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ServiceEntity> {
    return this.servicesService.findById(id);
  }
}

import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

interface CategoryResponse {
  id: string;
  name: string;
  icon: string;
  desc: string;
  color: string;
}

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll(): Promise<CategoryResponse[]> {
    const categories = await this.categoriesService.findAll();

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      desc: cat.description,
      color: cat.color,
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  async findById(@Param('id') id: string): Promise<CategoryResponse> {
    const cat = await this.categoriesService.findById(id);

    return {
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      desc: cat.description,
      color: cat.color,
    };
  }
}

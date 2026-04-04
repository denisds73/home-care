import { IsOptional, IsString } from 'class-validator';

export class QueryServicesDto {
  @IsOptional()
  @IsString()
  category?: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class SearchServicesDto {
  @IsNotEmpty()
  @IsString()
  q!: string;
}

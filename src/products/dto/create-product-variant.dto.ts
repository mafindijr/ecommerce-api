
import {
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateProductVariantDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  color?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  size?: string;

  @IsString()
  @Length(1, 100)
  sku: string;
}

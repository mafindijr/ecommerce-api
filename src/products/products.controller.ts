
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/gurads/roles.guard';
import { Roles } from '../common/decorators/roles.decorators';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateVariantStockDto } from './dto/update-variant-stock.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}

  // Create product - Admin only
  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createProduct(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(
      dto.name,
      dto.price,
    );
  }

  // Create product variant - Admin only
  @Post(':id/variants')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createProductVariant(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateProductVariantDto,
  ) {
    return this.productsService.createProductVariant(id, dto);
  }

  // Get all product variants - Public, will be remove
  @Get('variants')
  async findAllVariants() {
    return this.productsService.findAllVariants();
  }

  // Get variants belonging to one product - Public
  @Get(':id/variants')
  async findProductVariants(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.findProductVariants(id);
  }

  // Get all products - Public
  @Get()
  async findAll() {
    return this.productsService.findAllProducts();
  }

  // Get one product - Public
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.findOneProduct(id);
  }

  // Update product - Admin only
  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, dto);
  }

  // Delete product - Admin only
  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.productsService.deleteProduct(id);
  }

  // Update variant stock - Admin only
  @Patch('variants/:id/stock')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateVariantStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVariantStockDto,
  ) {
    return this.productsService.updateVariantStock(
      id,
      dto.stock,
    );
  }
}

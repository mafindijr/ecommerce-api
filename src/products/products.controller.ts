import { 
    Controller, 
    Get, 
    Post, 
    Patch, 
    Delete, 
    Param, 
    ParseIntPipe, 
    Body
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
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

    @Post()
    @Roles('ADMIN')
    @UseGuards(JwtAuthGuard, RolesGuard) // now only authenticated user with admin role can create a product
    async createProduct(@Body() dto: CreateProductDto) {
        return this.productsService.createProduct(
            dto.name,
            dto.price,
        );
    }

    
    @Post(':id/variants')
    @Roles('ADMIN')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async createProductVariant(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateProductVariantDto,
    ) {
        return this.productsService.createProductVariant(
            id,
            dto,
        );
    }

    
    @Get(':id/variants')
    async findProductVariants(
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.productsService.findProductVariants(id);
    }



    @Get()
    async findAll() {
        return this.productsService.findAllProducts();
    }

    @Get(":id")
    async findOne(@Param('id', ParseIntPipe)  id: number) {
        return this.productsService.findOneProduct(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() UpdateProductDto: UpdateProductDto
    ) {
        return this.productsService.updateProduct(
            id,
            UpdateProductDto,
        );
    }

    @Delete(":id")
    async remove(
        @Param("id", ParseIntPipe) id: number
    ) {
        return this.productsService.deleteProduct(id);
    }

    @Patch('variants/:id/stock')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    updateVariantStock(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateVariantStockDto,
    ) {
        return this.productsService.updateVariantStock (
            id,
            dto.stock,
        );
    }

}

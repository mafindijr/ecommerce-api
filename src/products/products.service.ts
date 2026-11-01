import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { Database } from '../db/database.module';
import { products, productVariants } from '../db/schema';
import { DATABASE_CONNECTION } from '../db/database.module';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';

@Injectable()
export class ProductsService {

    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: Database,
    ) {}

    async createProduct(name: string, price: number) {
        
        return await this.db
            .insert(products)
            .values({
                name,
                price,
            })
            .returning();
    }

    
    async createProductVariant(
        productId: number,
        dto: CreateProductVariantDto,
    ) {
        // Check whether the parent product exists
        const [product] = await this.db
            .select()
            .from(products)
            .where(eq(products.id, productId));

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Create the product variant
        const [variant] = await this.db
            .insert(productVariants)
            .values({
                productId,
                color: dto.color ?? null,
                size: dto.size ?? null,
                sku: dto.sku,
            })
            .returning();

        return variant;
    }


    async findAllProducts() {
        return await this.db.select().from(products);
    }

    async findOneProduct(id: number) {

        const result = await this.db
            .select()
            .from(products)
            .where(eq(products.id, id));

        if (result.length === 0) {
            throw new NotFoundException('Product not found');
        }

        return  result[0];
    }

    async updateProduct(
        id: number,
        data: UpdateProductDto,
    ) {
        const result = await this.db
            .update(products)
            .set(data)
            .where(eq(products.id, id))
            .returning();

        if(result.length === 0) {
            throw new NotFoundException('Product not found');
        }

        return { message: 'Product updated successfully',
            product: result[0],
        };
    }

    async deleteProduct(id: number) {
        const result = await this.db
            .delete(products)
            .where(eq(products.id, id))
            .returning();

        if(result.length === 0) {
            throw new NotFoundException('Product not found');
        }

        return {
            message: 'Product deleted successfully',
            product: result[0],
        };
    }

    
}

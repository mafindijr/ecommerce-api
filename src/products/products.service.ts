import { Inject, Injectable, NotFoundException } from '@nestjs/common';
// import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { UpdateProductDto } from './dto/update-product.dto';

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

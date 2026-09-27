import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ProductsService {

    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: Database,
    ) {}

    
    findAllProducts() {
        return this.db.select().from(products);
    }

    findOneProducts(id: number) {
        return this.db.select().from(products).where(eq(products.id, id));
    }
}

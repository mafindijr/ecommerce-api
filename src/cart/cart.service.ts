import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';
import { eq } from 'drizzle-orm';
import { carts } from '../db/schema';

@Injectable()
export class CartService {
    constructor(
            @Inject(DATABASE_CONNECTION)
            private readonly db: Database
        ) {}

    async getOrCreateCart(userId: number) {

        const [userCart] = await this.db.select()
                                 .from(carts)
                                 .where(eq(carts.userId, userId));
        
        if(userCart) {
            return userCart;
        }

        const [newCart] = await this.db
                    .insert(carts)
                    .values({ userId })
                    .returning();

        return newCart;
    }
}

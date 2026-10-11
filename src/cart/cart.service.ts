import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';
import { eq } from 'drizzle-orm';
import { carts, cartItems, products } from '../db/schema';
import { AddCartItemDto } from './dto/add-cart-item.dto';

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

    async addItem(userId: number, dto: AddCartItemDto) {

        //find or create the authenticated user's cart
        const cart = await this.getOrCreateCart(userId); // we need to wait for the cart to return
         

        // check whether products exists

         const [product] = await this.db
                    .select()
                    .from(products)
                    .where(eq(products.id, dto.productId));
        
        if(!product) {
            throw new NotFoundException('Product not found');
        }

        // Insert the item into the cart

        const [addToCart] = await this.db
            .insert(cartItems)
            .values({
                cartId: cart.id,
                productId: dto.productId,
                quantity: dto.quantity,
            })
            .returning();

        // return the created cart item

        return addToCart;
    }
}

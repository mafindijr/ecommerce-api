import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';

import { and, eq } from 'drizzle-orm';
import {
  carts,
  cartItems,
  productVariants,
  products,
  orders,
  orderItems,
} from '../db/schema';

@Injectable()
export class OrdersService {

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async createOrder (userId: number) {

    //Find the custmer's cart
    const [cart] = await this.db
        .select()
        .from(carts)
        .where(eq(carts.userId, userId));

    if(!cart) {
        throw new NotFoundException('Cart Not Found');
    }

    // Retrieve cart items with product and variant details

    const items = await this.db
        .select({
            variantId: productVariants.id,
            productName: products.name,
            sku: productVariants.sku,
            color: productVariants.color,
            size: productVariants.size,
            unitPrice: products.price,
            quantity: cartItems.quantity,
        })
        .from (cartItems)
        .innerJoin (
            productVariants,
            eq(cartItems.variantId, productVariants.id)
        )
        .innerJoin (
            products,
            eq(productVariants.productId, products.id)
        )
        .where(eq(cartItems.cartId, cart.id));

    if(items.length === 0) {
        throw new BadRequestException('Your cart is empty');
    }

    // Then calculate the order total

    const total = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity, 0,
    );
    
    
    return {
      total,
      items  
    };

  }

}


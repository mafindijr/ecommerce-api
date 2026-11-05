import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';

import { eq, desc } from 'drizzle-orm';
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
   
      
      return await this.db.transaction(async (tx) => {

          //Find the custmer's cart
          const [cart] = await tx
              .select()
              .from(carts)
              .where(eq(carts.userId, userId))
              .for('update');
      
          if(!cart) {
              throw new NotFoundException('Cart Not Found');
          }
      
          // Retrieve cart items with product and variant details
      
          const items = await tx
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
          
        //create the order 

        const [order] = await tx
            .insert(orders)
            .values({
                userId,
                total,
            })
            .returning();
        
        // Now save the cart items as order items
        
        await tx.insert(orderItems).values(
            items.map((item) => ({
                orderId: order.id,
                variantId: item.variantId,
                productName: item.productName,
                sku: item.sku,
                color: item.color,
                size: item.size,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                
            })),

        );

        // Then clear the customer's cart 

        await tx
            .delete(cartItems)
            .where(eq(cartItems.cartId, cart.id));
        
        // Then return the created order

        return {
            message: 'Order created successfully',
            order,
            items,
        };
    });

  }

  async getMyOrders(userId: number) {
    
  return this.db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
}

}


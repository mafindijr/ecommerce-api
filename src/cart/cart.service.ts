import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';
import { and, eq } from 'drizzle-orm';
import { carts, cartItems, products, productVariants} from '../db/schema';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

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
         

        // // check whether products exists

        //  const [product] = await this.db
        //             .select()
        //             .from(products)
        //             .where(eq(products.id, dto.variantId));
        
        // if(!product) {
        //     throw new NotFoundException('Product not found');
        // }

        // check whether products varianr exists
        const [variant] = await this.db
            .select()
            .from(productVariants)
            .where(eq(productVariants.id, dto.variantId));

        if(!variant) {
            throw new NotFoundException('Product variant not found');
        }

        // checking whether product is already in the cart

        const [existingItem] = await this.db
            .select()
            .from(cartItems)
            .where(
                and(
                    eq(cartItems.cartId, cart.id),
                    eq(cartItems.variantId, dto.variantId),
                ),
            );

        // if it exists, increase the quantity

        if (existingItem) {
            const [updatedItem] = await this.db
                .update(cartItems)
                .set({
                    quantity: existingItem.quantity + dto.quantity,
                })
                .where(eq(cartItems.id, existingItem.id))
                .returning();

                return updatedItem;
        }

        // otherwise, Insert the new item into the cart

        const [newItem] = await this.db
            .insert(cartItems)
            .values({
                cartId: cart.id,
                variantId: dto.variantId,
                quantity: dto.quantity,
            })
            .returning();

        // return the created cart item

        return newItem;
    }

    async getCart(userId: number) {

        // finding user's cart using my method
        const cart = await this.getOrCreateCart(userId);

        // retrieve cart items and their products and variants details using innerJoin

        const items = await this.db
            .select({
                id: cartItems.id,
                varientId: productVariants.id,
                productId: products.id,
                name: products.name,
                color: productVariants.color,
                size: productVariants.size,
                sku: productVariants.sku,
                price: products.price,
                quantity: cartItems.quantity,
            })
            .from(cartItems)
            .innerJoin(
                productVariants,
                eq(cartItems.variantId, productVariants.id),
            )
            .innerJoin(
                products,
                eq(productVariants.id, products.id)
            )
            .where(eq(cartItems.cartId, cart.id));

            // calculate each items sub total

            const itemsWithSubtotal = items.map((item) => ({
                ...item,
                subtotal: item.price * item.quantity,
            }));

            // calculate cart total
            const total = itemsWithSubtotal.reduce(
                (sum, item) => sum + item.subtotal,
                0,
            );

            // return the cart 

            return {
                cartId: cart.id,
                items: itemsWithSubtotal,
                total,
            }; 

    }

    async updateItem(
        userId: number,
        itemId: number,
        dto: UpdateCartItemDto
    ) {
        // finding auth user

        const cart = await this.getOrCreateCart(userId);

        // updating only an item belonging to that cart

        const [updatedItem] = await this.db
            .update(cartItems)
            .set({
                quantity: dto.quantity
            })
            .where(
                and (
                        eq(cartItems.id, itemId),
                        eq(cartItems.cartId, cart.id)
                    )
            )
            .returning();

            // if no items was updated, it doesnt belong to this cart

            if (!updatedItem) {
                throw new NotFoundException('Cart item not found');
            }

        return updatedItem;
    }

    async removeItem (userId: number, itemId: number) {

        //find auth user's cart

        const cart = await this.getOrCreateCart(userId);

        // delete only an item belonging to the cart

        const [deleteItem] = await this.db
            .delete(cartItems)
            .where(
                and (
                    eq(cartItems.id, itemId),
                    eq(cartItems.cartId, cart.id)
                ),
            )
            .returning();

            // handle missing items
           
            if (!deleteItem) {
                throw new NotFoundException('Cart item not found');
            }

            return {
                message: 'Cart item removed successfully',
                deleteItem,
            };
    }
}
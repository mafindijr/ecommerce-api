import {
    integer,
    pgTable,
    unique,
} from 'drizzle-orm/pg-core';
import { carts } from './cart.schema';
import { products } from './products.schema';


export const cartItems = pgTable('cart_items', {

    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    cartId: integer()
        .notNull()
        .references(() => carts.id),

    productId: integer()
        .notNull()
        .references(() => products.id),

    quantity: integer().notNull(),
},
(table) => [
    unique('cart_items_cart_product_unique').on(
        table.cartId,
        table.productId,
    ),
]
);
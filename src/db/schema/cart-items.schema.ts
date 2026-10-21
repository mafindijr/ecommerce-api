import {
    integer,
    pgTable,
    unique,
} from 'drizzle-orm/pg-core';
import { carts } from './cart.schema';
import { productVariants } from './product-variants.schema';


export const cartItems = pgTable('cart_items', {

    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    cartId: integer()
        .notNull()
        .references(() => carts.id),

    variantId: integer()
        .notNull()
        .references(() => productVariants.id),

    quantity: integer().notNull(),
},
(table) => [
    unique('cart_items_cart_product_unique').on(
        table.cartId,
        table.variantId,
    ),
]
);
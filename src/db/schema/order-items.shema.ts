import {
    integer,
    pgTable,
    varchar,
} from 'drizzle-orm/pg-core';
import { orders } from './orders.shema';
import { productVariants } from './product-variants.schema';


export const orderItems = pgTable('order_items', {
    
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    orderId: integer()
        .notNull()
        .references(() => orders.id),

    variantId: integer()
        .notNull()
        .references(() => productVariants.id),

    productName: varchar({ length: 255 }).notNull(),

    sku: varchar({ length: 100 }).notNull(),

    color: varchar({ length: 50 }),

    size: varchar({ length: 50 }),

    unitPrice: integer().notNull(),

    quantity: integer().notNull(),
});
import { sql } from 'drizzle-orm';
import { integer, pgTable, varchar, unique, check } from 'drizzle-orm/pg-core';

import { products } from './products.schema';

export const productVariants = pgTable(
    'product_variants', {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        productId: integer()
            .notNull()
            .references(() => products.id),

            color: varchar({ length: 50}),

            size: varchar({ length: 50}),

            sku: varchar({ length: 100 }).notNull().unique(),

            stock: integer().notNull().default(0),

            reservedStock: integer().notNull().default(0),
    },
    (table) => [
        unique('product_variants_product_color_size_unique').on(
            table.productId,
            table.color,
            table.size,
        ),
         check(
           'product_variants_reserved_stock_check',
            sql`${table.reservedStock} <= ${table.stock}`,
        ),

        check(
            'product_variants_stock_non_negative',
             sql`${table.stock} >= 0`,
        ),

        check(
         'product_variants_reserved_stock_non_negative',
          sql`${table.reservedStock} >= 0`,
        ),
    ],
)
import { integer, pgTable, varchar, unique } from 'drizzle-orm/pg-core';
import { products } from './products.schema';
import { varbinary } from 'drizzle-orm/mysql-core';
import { table } from 'console';

export const productVariants = pgTable(
    'product_variants', {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        productId: integer()
            .notNull()
            .references(() => products.id),

            color: varchar({ length: 50}),

            size: varchar({ length: 50}),

            sku: varchar({ length: 100 }).notNull().unique(),
    },
    (table) => [
        unique('product_variants_product_color_size_unique').on(
            table.productId,
            table.color,
            table.size,
        ),
    ],
)
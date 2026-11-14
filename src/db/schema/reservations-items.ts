import { integer, pgTable, unique, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { stockReservations } from './stock-reservations';
import { productVariants } from './product-variants.schema';


export const stockReservationItems = pgTable(
    'stock_reservation_items', {
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        reservationId: integer().notNull().references(() => stockReservations.id),

        variantId: integer().notNull().references(() => productVariants.id),

        quantity: integer().notNull(),
    },
    (table) => [
        unique('stock_reservation_items_unique').on(
        table.reservationId,
        table.variantId,
        ),

        check(
        'stock_reservation_items_quantity_positive',
        sql`${table.quantity} > 0`,
        ),
    ],
)
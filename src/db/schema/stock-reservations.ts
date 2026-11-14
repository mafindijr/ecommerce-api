import { integer, pgTable, timestamp , pgEnum, unique } from 'drizzle-orm/pg-core';
import { orders } from './orders.shema';



export const reservationStatusEnum = pgEnum('reservation_status', [
    'ACTIVE',
    'CONSUMED',
    'EXPIRED',
    'RELEASED'
]);

export const stockReservations = pgTable(
    'stock_reservations',{
        id: integer().primaryKey().generatedAlwaysAsIdentity(),

        orderId: integer().notNull().references(() => orders.id),

        status: reservationStatusEnum().notNull().default('ACTIVE'),

        expiresAt: timestamp().notNull(),

        createdAt: timestamp().defaultNow().notNull(),

        updatedAt: timestamp().defaultNow().notNull(),

},
(table) => [
  unique('stock_reservations_order_unique').on(table.orderId),
],
)

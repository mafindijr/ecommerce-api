import {
    integer,
    pgEnum,
    pgTable,
    timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const orderStatusEnum = pgEnum('order_status', [
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
]);

export const orders = pgTable('orders', {
    
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    userId: integer()
        .notNull()
        .references(() => users.id),

    status: orderStatusEnum()
        .notNull()
        .default('PENDING'),

    total: integer().notNull(),

    createdAt: timestamp().defaultNow().notNull(),

    updatedAt: timestamp().defaultNow().notNull(),
});
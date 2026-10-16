import {
    integer,
    pgTable,
    timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const carts = pgTable('carts', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    userId: integer()
        .notNull()
        .unique()
        .references(() => users.id),

        createdAt: timestamp().defaultNow().notNull(),

        updatedAt: timestamp().defaultNow().notNull(),
});

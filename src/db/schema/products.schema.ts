import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255}).notNull(),
    price: integer().notNull(),
});
import {
    integer,
    pgEnum,
    pgTable,
    varchar,
    timestamp,
} from 'drizzle-orm/pg-core';



export const userRoleEnum = pgEnum('user_role', [
    'CUSTOMER',
    'ADMIN'
]);


export const users = pgTable('users', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),

    name: varchar({length: 255}).notNull(),

    email: varchar({length: 255}).notNull().unique(),

    password: varchar({length: 255}).notNull(),

    role: userRoleEnum().notNull().default('CUSTOMER'),

    createdAt: timestamp().defaultNow().notNull(),

    updatedAt: timestamp().defaultNow().notNull(),
})


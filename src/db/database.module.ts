import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';


export const DATABASE_CONNECTION = 'DATABASE-CONNECTION';

export const createdDatabase = (pool: Pool) => {
    return drizzle(pool, { schema });
};

export type Database = ReturnType<typeof createdDatabase>;

@Global() // this makes it available everywhere with import everywhere
@Module({
    providers: [
        {
            provide: DATABASE_CONNECTION,

            inject: [ConfigService],

            useFactory: async (configService: ConfigService) => {
                const databaseUrl = configService.get<string>('DATABASE_URL');

                if (!databaseUrl) {
                    throw new Error('DATABASE_URL is not defined in .env');
                }

                const pool = new Pool({
                    connectionString: databaseUrl,
                });

                await pool.query('SELECT 1');

                return createdDatabase(pool);
            },
        },
    ],

    exports: [DATABASE_CONNECTION],
})

export class DatabaseModule {}
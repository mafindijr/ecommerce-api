import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from './schema';


export const DATABASE_CONNECTION = 'DATABASE-CONNECTION';

@Global() // this makes it available everywhere with import everywhere
@Module({
    providers: [
        {
            provide: DATABASE_CONNECTION,

            inject: [ConfigService],

            useFactory: async (ConfigService: ConfigService) => {

                //1- Read DATABASE_URL
                
                const databaseUrl = ConfigService.get<string>('DATABASE-URL');
                
                if (!databaseUrl) {
                    throw new Error('DATABASE_URL is not define in .env');
                }

                //2- create postgresql connection string pg

                const pool = new Pool({
                    connectionString: databaseUrl,
                    // ssl: databaseUrl.includes('localhost')? false: {rejectUnauthorized: false}, will configure this during deployment
                });

                //Test connection
                // await pool.connect(); you are realeasing client when you do this
                await pool.query('SELECT 1');


                //3 create drizzle database instance
                
                const db = drizzle(pool, { schema });

                return db;
            },
        },
    ],

    exports: [DATABASE_CONNECTION],
})

export class DatabaseModule {}
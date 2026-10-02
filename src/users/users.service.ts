import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema'

@Injectable()
export class UsersService {
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: Database
    ) {}


    async findByEmail(email: string) {

        const [user] = await this.db
                .select()
                .from(users)
                .where(eq(users.email, email));
        

        return user || null;
                
    }

    async createUser(data: {name: string, email: string, password: string}) {

        const [user] = await this.db
            .insert(users)
            .values(data)
            .returning();
        
        return user;    
    }


}

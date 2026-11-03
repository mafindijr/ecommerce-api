import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';

@Injectable()
export class OrdersService {

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}
  
}


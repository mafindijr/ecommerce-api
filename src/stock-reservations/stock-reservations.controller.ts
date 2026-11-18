import { Controller, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';
import { StockReservationsService} from './stock-reservations.service';


@Controller('stock-reservations')
export class StockReservationsController {

    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: Database,

        private readonly stockReservationService: StockReservationsService
    ) {}

    @Post(':id/expire')
    async expireReservation (

        @Param('id', ParseIntPipe) id: number
    ){
        return this.db.transaction(async (tx) => {
            return this.stockReservationService.expireReservation(
                tx,
                id,
            );
        });
    }
}


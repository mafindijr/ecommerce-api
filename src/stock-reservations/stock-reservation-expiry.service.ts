import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { and, eq, sql } from 'drizzle-orm';

import { DATABASE_CONNECTION } from '../db/database.module';
import type { Database } from '../db/database.module';
import { stockReservations } from '../db/schema';
import { StockReservationsService } from './stock-reservations.service';


@Injectable()
export class StockReservationExpiryService {
    private readonly logger = new Logger(
        StockReservationExpiryService.name,
    );

    constructor (
        @Inject(DATABASE_CONNECTION)
        private readonly db: Database,

        private readonly stockReservationService: StockReservationsService,
    ){}

    //Run automatically every minute.

    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpireReservations() {
        this.logger.log('Checking for expired stock reservations...');
        

        // Find reservations that expired but still ACTIVE

        const expiredReservations = await this.db
            .select({
                id: stockReservations.id,
            })
            .from(stockReservations)
            .where(
                and(
                    eq(stockReservations.status, 'ACTIVE'),
                    sql`${stockReservations.expiresAt} <= NOW()`,
                )
            );

        if (expiredReservations.length === 0) {
            this.logger.log('No expired reservations found.')
            return;
        }

        this.logger.log(
            `Found ${expiredReservations.length} expired reservations(s).`,
        );

        // Process each reservation independently
        for(const reservation of expiredReservations) {
            try {
                const result = await this.db.transaction(async (tx) => {
                    return this.stockReservationService.expireReservation(
                        tx,
                        reservation.id,
                    );
                });
                
                if (result.expired) {
                    this.logger.log(
                        `Reservation ${reservation.id} expired successfully.`,
                    );
                }
            } catch (error) {
                this.logger.error(
                    `Failed tp expire reservation ${reservation.id}.`,
                    error instanceof Error? error.stack : String(error),
                );
            }
        }
    }
}

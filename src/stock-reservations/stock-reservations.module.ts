
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../db/database.module';
import { StockReservationsService } from './stock-reservations.service';
import { StockReservationsController } from './stock-reservations.controller';
import { StockReservationExpiryService } from './stock-reservation-expiry.service';

@Module({
  imports: [DatabaseModule],
  providers: [
    StockReservationsService,
    StockReservationExpiryService,
  ],
  exports: [StockReservationsService],
  controllers: [StockReservationsController],
})
export class StockReservationsModule {}

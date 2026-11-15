
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../db/database.module';
import { StockReservationsService } from './stock-reservations.service';

@Module({
  imports: [DatabaseModule],
  providers: [StockReservationsService],
  exports: [StockReservationsService],
})
export class StockReservationsModule {}

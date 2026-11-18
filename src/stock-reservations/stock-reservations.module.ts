
import { Module } from '@nestjs/common';

import { DatabaseModule } from '../db/database.module';
import { StockReservationsService } from './stock-reservations.service';
import { StockReservationsController } from './stock-reservations.controller';

@Module({
  imports: [DatabaseModule],
  providers: [StockReservationsService],
  exports: [StockReservationsService],
  controllers: [StockReservationsController],
})
export class StockReservationsModule {}

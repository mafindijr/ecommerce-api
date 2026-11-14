import { Module } from '@nestjs/common';
import { StockReservationsService } from './stock-reservations.service';

@Module({
  providers: [StockReservationsService]
})
export class StockReservationsModule {}

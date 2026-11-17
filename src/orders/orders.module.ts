import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { StockReservationsModule } from '../stock-reservations/stock-reservations.module';

@Module({
    imports:[
         PassportModule.register({
            defaultStrategy: 'jwt',
        }),

        StockReservationsModule,
    ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}

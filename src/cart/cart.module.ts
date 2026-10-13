import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  imports:[
       PassportModule.register({
          defaultStrategy: 'jwt',
      }),
  ],
  providers: [CartService],
  controllers: [CartController]
})
export class CartModule {}

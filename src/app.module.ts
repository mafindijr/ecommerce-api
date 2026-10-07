import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { DatabaseModule } from './db/database.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    // ObserveModule.forRoot
    ConfigModule.forRoot({
      // appKey: 'YOUR_APP_KEY',
      // appSecret: 'YOUR_APP_SECRET',
      // serviceId: 'ecommerce-api',

      isGlobal: true,
      envFilePath: '.env', 
    }),
  
  DatabaseModule,

  ProductsModule,

  UsersModule,

  AuthModule,
],
  
})
export class AppModule {}

import { Controller, Post, Get, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createOrder(@Req() req: any) {
    return this.ordersService.createOrder(req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
    getMyOrders(@Req() req: any) {
        return this.ordersService.getMyOrders(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrderById (
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {

    return this.ordersService.getOrderById(
        id,
        req.user.userId,
    );
  }

}
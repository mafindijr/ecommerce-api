import { Controller, Post, Get, Patch, Body, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { UpdateOrdersStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
import { Roles } from '../common/decorators/roles.decorators';
import { RolesGuard } from '../common/gurads/roles.guard';
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

  @Patch(':id/status')
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrdersStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(id, dto.status,);
  }

}
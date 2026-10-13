import { Get, Post, Body, Controller, UseGuards, Req,  } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Controller('cart')
export class CartController {

    constructor(private readonly cartService: CartService) {}

    //creating POST /cart/items endpoint

    @Post('items')
    @UseGuards(JwtAuthGuard)
    async addItem(@Req() req: any, @Body() dto: AddCartItemDto) {

        const userId = req.user.userId;

         return this.cartService.addItem(userId, dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    getCart(@Req() req: any) {
        const userId = req.user.userId;

        return this.cartService.getCart(userId);
    }


}

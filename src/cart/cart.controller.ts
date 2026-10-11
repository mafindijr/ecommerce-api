import { Post, Body, Controller, UseGuards, Req,  } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Controller('cart')
export class CartController {

    //creating POST /cart/items endpoint

    @Post('items')
    @UseGuards(JwtAuthGuard)
    async addItem(@Body() dto: AddCartItemDto) {
        
    }


}

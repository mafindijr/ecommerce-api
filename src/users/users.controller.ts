import {
     Controller,
      Get, 
      Req, 
      UseGuards,
    } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMetadata(@Req() req: any) {
        return req.user;
    }
}

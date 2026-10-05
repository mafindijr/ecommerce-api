import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PassportModule } from '@nestjs/passport';
import { UsersController } from './users.controller';

@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'jwt',
        }),
    ],
    providers: [ UsersService ],
    controllers: [UsersController],
    exports: [ UsersService ], //important - to use in auth
})
export class UsersModule {}


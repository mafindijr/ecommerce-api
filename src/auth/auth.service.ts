import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async register(dto: RegisterDto) {

        const existing = await this.usersService.findByEmail(dto.email);

        if(existing) {
            throw new ConflictException('Email already exists');

        }

        //hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.createUser({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
        });

        //exclude password from response
        const { password, ...result } = user;

        return result;

    }
}

import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {

        const existing = await this.usersService.findByEmail(dto.email);

        if(existing) {
            throw new ConflictException('Email already exists');

        }

        //hash password using bcrypt
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


    async login (dto: LoginDto) {

        const user = await this.usersService.findByEmail(dto.email);

        if(!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(
            dto.password,
            user.password
        );

        if(!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // now creating the JWT
        const payLoad = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = await this.jwtService.signAsync(payLoad);


        return {
            accessToken,
        }

    }
}

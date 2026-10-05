import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

//what this does is that - when put on a route nest says: before allowing this request to reach the controller, checker whether the user has a valid JWT 
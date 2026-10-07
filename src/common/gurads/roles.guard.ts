import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core'; //allow you to read metadata created by decorators such as @Roles('Admin')

import { ROLES_KEY } from '../decorators/roles.decorators';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private reflector: Reflector ) {}

        canActivate(context: ExecutionContext): boolean {

            const requiredRoles = this.reflector.getAllAndOverride<string[]>( // getAllOveride looks for out @Roles()

                ROLES_KEY,
                [context.getHandler(), //this get the spcific controller method e.g @Delete(':id') then delete product(){}
                    context.getClass()], // this get the contoroller itself
            );

            if (!requiredRoles) {
                return true;
            }

            const request = context.switchToHttp().getRequest();
            const user = request.user; // out guard can now see user.role from our return payload

            if(!user) {
                throw new ForbiddenException('User not found');
            }

            const hasRole = requiredRoles.includes(user.role);

            if(!hasRole) {
                throw new ForbiddenException('You do not have permission');
            }

            return true;
        }
}
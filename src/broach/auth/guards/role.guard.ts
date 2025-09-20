import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";
import { UserType } from "@prisma/client";
import { ROLES_KEY } from "src/common/decorators/roles.decorator";



@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if(!requiredRoles) return true;

        const { user } = context.switchToHttp().getRequest();

        if (!user || !requiredRoles.includes(user.userType)) {
            throw new ForbiddenException(
                "You do not have permission to access this resource",
            );
        }

        return true;
    }
}
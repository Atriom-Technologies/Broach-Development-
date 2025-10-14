import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { RequestWithUserPayload } from '../interfaces/jwt-payload.interface';

/*  RolesGuard

  A guard responsible for enforcing role-based access control (RBAC). It checks if the currently authenticated user's role matches 
  
  any of the roles specified on the route handler or controller using the @Roles() decorator.
 */

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines whether the current request can proceed based on user roles.
   * @param context - Provides access to details about the current request.
   * @returns `true` if access is allowed; otherwise throws a ForbiddenException.
   */

  canActivate(context: ExecutionContext): boolean {
    // Retrieve the roles required for this route (if defined)
    // getAllAndOverride: checks the handler first, then the controller.
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // if no roles asigned disallow access
    if (!requiredRoles) return true;

    // Extract the authenticated user object from the current HTTP request.
    const request = context.switchToHttp().getRequest<RequestWithUserPayload>();
    const user = request.user;

    // Deny access if the user is missing or their role is not permitted.
    if (!user || !requiredRoles.includes(user.userType as UserType)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    // Allow the request to proceed if the user's role is authorized.
    return true;
  }
}

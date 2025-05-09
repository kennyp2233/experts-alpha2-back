
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, access granted
    }

    const { user } = context.switchToHttp().getRequest();

    // Check if user exists and has roles
    if (!user || !user.roles) {
      return false; // User or user roles not found, access denied
    }

    // Check if the user has at least one of the required roles AND that role's status is 'APROBADO'
    return requiredRoles.some(role =>
      user.roles.some(userRole => userRole.nombre === role && userRole.estado === 'APROBADO')
    );
  }
}

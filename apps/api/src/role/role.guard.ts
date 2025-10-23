import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "./role.enum";
import { Request } from "express";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const endpointRoles = this.reflector.getAllAndOverride<Role[]>(
            "roles",
            [context.getHandler(), context.getClass()],
        );

        // Unprotected endpoints
        if (!endpointRoles) {
            return true;
        }

        const request: Request = context.switchToHttp().getRequest();
        const userRoles: Role[] = request["user"].roles;

        if (!endpointRoles.some((role) => userRoles.includes(role)))
            return false;

        return true;
    }
}

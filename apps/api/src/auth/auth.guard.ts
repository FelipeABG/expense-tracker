import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>("IsPublic", [
            context.getHandler(),
            context.getClass(), // In case the controller is marked as public (all its endpoints will be public)
        ]);

        //Skips authentication if the endpoint is marked as public
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();

        const token = this.extractTokenFromRequest(request);

        if (!token) {
            throw new UnauthorizedException("Missing authentication token");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get("SECRET_KEY"),
            });

            request["user"] = payload;
        } catch (err) {
            throw new UnauthorizedException("Invalid authentication token");
        }
        return true;
    }

    extractTokenFromRequest(request: Request) {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}

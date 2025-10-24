import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";
import { AuthController } from "./auth.controller";
import { RoleGuard } from "../role/role.guard";

@Module({
    providers: [
        AuthService,
        // Global authentication and authorization guard (APP_GUARD ensures it is global)
        { provide: APP_GUARD, useClass: AuthGuard },
        { provide: APP_GUARD, useClass: RoleGuard },
    ],
    controllers: [AuthController],
    imports: [
        ConfigModule,
        UserModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                global: true,
                secret: configService.get("SECRET_KEY"),
                signOptions: { expiresIn: "1d" },
            }),
        }),
    ],
})
export class AuthModule {}

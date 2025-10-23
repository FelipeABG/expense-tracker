import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./auth.guard";

@Module({
    // Global authentication guard (APP_GUARD ensures it is global)
    providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
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

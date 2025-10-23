import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import validate from "./config/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";

@Module({
    imports: [
        ConfigModule.forRoot({ validate }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const ENV = configService.get("NODE_ENV");
                return {
                    type: "postgres",
                    url: configService.get(
                        ENV === "prod" ? "DB_URL" : "DEV_DB_URL",
                    ),
                    autoLoadEntities: true,
                    synchronize: ENV !== "prod",
                };
            },
        }),
        UserModule,
        AuthModule,
    ],
})
export class AppModule {}

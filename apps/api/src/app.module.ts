import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import validate from "./config/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot({ validate }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const ENV = configService.get("NODE_ENV");
                if (ENV === "production") {
                    return {
                        type: "postgres",
                        url: configService.get("DB_URL"),
                        autoLoadEntities: true,
                        synchronize: false,
                    };
                } else if (ENV === "test") {
                    return {
                        type: "sqlite",
                        database: ":memory:",
                        synchronize: true,
                        autoLoadEntities: true,
                        dropSchema: true,
                    };
                } else {
                    // ENV_NODE=development
                    return {
                        type: "postgres",
                        url: configService.get("DEV_DB_URL"),
                        autoLoadEntities: true,
                        synchronize: true,
                    };
                }
            },
        }),
        UserModule,
    ],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import validate from "./config/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ExpenseModule } from "./expense/expense.module";
import { RevenueModule } from "./revenue/revenue.module";

@Module({
    imports: [
        ConfigModule.forRoot({ validate }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const ENV = configService.get("NODE_ENV");
                let common = {
                    autoLoadEntities: true,
                    synchronize: ENV !== "prod",
                };
                if (ENV === "test") {
                    return {
                        type: "sqlite",
                        database: ":memory:",
                        ...common,
                    };
                }
                return {
                    type: "mysql",
                    url: configService.get(
                        ENV === "prod" ? "DB_URL" : "DEV_DB_URL",
                    ),
                    ...common,
                };
            },
        }),
        UserModule,
        AuthModule,
        ExpenseModule,
        RevenueModule,
    ],
})
export class AppModule {}

import { Test } from "@nestjs/testing";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import validate from "../config/config";
import { UserModule } from "./user.module";
import { Role } from "../role/role.enum";
import { ConflictException } from "@nestjs/common";

describe("UserService", () => {
    const user = { email: "giuseppe@gmail.com", hash: "fadjslfkjad;slfjk" };
    let userService: UserService;

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
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
        }).compile();

        userService = modRef.get(UserService);
    });

    describe("findAll", () => {});

    describe("findBy", () => {});

    describe("create", () => {
        it("Should create a new user in the db and return the created user", async () => {
            const result = await userService.create(user);
            expect(result.email).toBe(user.email);
            expect(result.hash).toBe(user.hash);
            expect(result.roles).toStrictEqual([Role.user]);
        });

        it("Should fail if  the user already exist in the db", async () => {
            await expect(userService.create(user)).rejects.toThrow(
                ConflictException,
            );
        });
    });
});

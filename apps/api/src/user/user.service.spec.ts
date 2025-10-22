import { Test } from "@nestjs/testing";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import validate from "../config/config";
import { UserModule } from "./user.module";
import { Role } from "../role/role.enum";
import { ConflictException, NotFoundException } from "@nestjs/common";

describe("UserService", () => {
    const user = {
        email: `test-user${Date.now()}@gmail.com`,
        hash: "fadjslfkjad;slfjk",
    };
    let userService: UserService;

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ validate }),
                TypeOrmModule.forRoot({
                    type: "sqlite",
                    database: ":memory:",
                    synchronize: true,
                    autoLoadEntities: true,
                }),
                UserModule,
            ],
        }).compile();

        userService = modRef.get(UserService);
    });

    describe("create", () => {
        it("Should create a new user in the db and return the created user", async () => {
            const result = await userService.create(user);
            expect(result.email).toBe(user.email);
            expect(result.hash).toBe(user.hash);
            expect(result.roles).toStrictEqual([Role.user]);
        });

        it("Should fail if the user already exist in the db", async () => {
            await expect(userService.create(user)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe("findBy", () => {
        it("Should return the user specified by an unique field", async () => {
            const response = await userService.findBy({ email: user.email });
            expect(response.email).toBe(user.email);
            expect(response.id).toBeDefined();
        });

        it("Should fail if the user does not exist", async () => {
            await expect(
                userService.findBy({ email: "fjsld34btgoui3n" }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("findAll", () => {
        it("Should return a list of users", async () => {
            const response = await userService.findAll();
            expect(response.length).toBe(1);
        });
    });

    describe("delete", () => {
        it("Should delete an user and return a successfull message", async () => {
            const response = await userService.delete({ email: user.email });
            expect(response.message).toBe("User deleted successfully");
        });

        it("Should fail if the user does not exist", async () => {
            await expect(
                userService.delete({ email: "fjrn549n5b9tu4j" }),
            ).rejects.toThrow(NotFoundException);
        });
    });
});

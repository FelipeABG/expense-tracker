import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import {
    ConflictException,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { AppModule } from "../app.module";

describe("UserService", () => {
    const user = {
        email: `test-user${Date.now()}@gmail.com`,
        password: "Very_crazy_password",
    };
    let authService: AuthService;

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        authService = modRef.get(AuthService);
    });

    describe("signup", () => {
        it("Should register a new user in the db and return a successfull message", async () => {
            const result = await authService.signup(user.email, user.password);

            expect(result.message).toBe("Signed up successfully");
        });

        it("Should throw an error if the user already exists in the db", async () => {
            await expect(
                authService.signup(user.email, user.password),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe("login", () => {
        it("Should log a user in the system and return the jwt token", async () => {
            const result = await authService.login(user.email, user.password);

            expect(result.message).toBe("Logged in successfully");
            expect(result.token).toBeDefined();
        });

        it("Should throw an error if the password is incorrect", async () => {
            await expect(
                authService.login(user.email, "fjkdljf"),
            ).rejects.toThrow(UnauthorizedException);
        });

        it("Should throw an error if the user does not exist in the db", async () => {
            await expect(
                authService.login("jfdjkrnfn", "jntogvn"),
            ).rejects.toThrow(NotFoundException);
        });
    });
});

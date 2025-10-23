import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";

describe("AuthController (e2e)", () => {
    let app: INestApplication<App>;
    const user = {
        email: `test-user${Date.now()}@gmail.com`,
        password: "Strongassoword123!",
    };

    beforeAll(async () => {
        const modRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = modRef.createNestApplication();
        await app.init();
    });

    describe("/auth/signup (POST)", () => {
        const path = "/auth/signup";

        it("Should return 201 when successful", async () => {
            return request(app.getHttpServer())
                .post(path)
                .send(user)
                .expect(201)
                .then((response) =>
                    expect(response.body.message).toBe(
                        "User registered successfully",
                    ),
                );
        });

        it("Should return 409 when user already exists in the db", async () => {
            return request(app.getHttpServer())
                .post(path)
                .send(user)
                .expect(409)
                .then((response) =>
                    expect(response.body.message).toBe(
                        "Email address is already registered",
                    ),
                );
        });
    });

    describe("/auth/login (POST)", () => {
        const path = "/auth/login";
        it("Should return 200 with the token when successful", async () => {
            return request(app.getHttpServer())
                .post(path)
                .send(user)
                .expect(200)
                .then((response) => expect(response.body.token).toBeDefined());
        });

        it("Should return 401 when credentials are invalid", async () => {
            return request(app.getHttpServer())
                .post(path)
                .send({ email: user.email, password: "SomeotherPasssword157!" })
                .expect(401)
                .then((response) =>
                    expect(response.body.message).toBe("Invalid credentials"),
                );
        });

        it("Should return 404 when user is not registered", async () => {
            return request(app.getHttpServer())
                .post(path)
                .send({ email: "email@email.com", password: user.password })
                .expect(404)
                .then((response) =>
                    expect(response.body.message).toBe("User does not exist"),
                );
        });
    });
});

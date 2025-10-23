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

    beforeEach(async () => {
        const modRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = modRef.createNestApplication();
        await app.init();
    });

    it("/auth/signup (POST)", async () => {
        return request(app.getHttpServer())
            .post("/auth/signup")
            .send(user)
            .expect(201)
            .then((response) =>
                expect(response.body.message).toBe(
                    "User registered successfully",
                ),
            );
    });
});

import { Test } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";

// Test global configurations (authentication, authorization, validation).
// If it works for one, works for all.
describe("Global settings (e2e)", () => {
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

    describe("Validation", () => {
        it("Should return 400 when validation fails", async () => {
            return request(app.getHttpServer())
                .post("/auth/login")
                .send({ email: "foo", password: "bar" })
                .expect(400)
                .then((response) => {
                    expect(response.body.bodyResult).toBeDefined();
                    expect(response.body.bodyResult.issues).toBeDefined();
                });
        });
    });
});

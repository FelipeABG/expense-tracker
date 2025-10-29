import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import {
    generateTestModule,
    generateTestUser,
    UserFormat,
} from "../src/utils/test.util";

// Test global configurations (authentication, authorization, validation).
// If it works for one, works for all.
describe("Global settings (e2e)", () => {
    let app: INestApplication<App>;
    const user = generateTestUser(UserFormat.PASSWORD);
    beforeAll(async () => {
        const modRef = await generateTestModule();
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

    describe("Authentication", () => {
        it("Should return 401 when request is not authenticated", async () => {
            return request(app.getHttpServer())
                .get("/users")
                .expect(401)
                .then((response) =>
                    expect(response.body.message).toBe(
                        "Missing authentication token",
                    ),
                );
        });
    });

    describe("Authorization", () => {
        it("Should return 403 when user does not have the required privileges", async () => {
            await request(app.getHttpServer()).post("/auth/signup").send(user);

            const token = await request(app.getHttpServer())
                .post("/auth/login")
                .send(user)
                .then((response) => response.body.token);

            return request(app.getHttpServer())
                .get("/users")
                .set("Authorization", `Bearer ${token}`)
                .send()
                .expect(403)
                .then((response) =>
                    expect(response.body.message).toBe(
                        "Access denied: Insufficient privileges",
                    ),
                );
        });
    });
});

import { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
    generateTestRevenue,
    generateTestModule,
    generateTestUser,
    UserFormat,
} from "../src/utils/test.util";

describe("RevenueController (e2e)", () => {
    let app: INestApplication;
    const user = generateTestUser(UserFormat.PASSWORD);
    const revenue = generateTestRevenue();

    let authToken: string;

    beforeAll(async () => {
        const modRef = await generateTestModule();
        app = modRef.createNestApplication();
        await app.init();

        // Create user
        await request(app.getHttpServer())
            .post("/auth/signup")
            .send(user)
            .expect(201);

        // Login user and get token
        const loginResponse = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                email: user.email,
                password: user.password,
            })
            .expect(200);

        authToken = loginResponse.body.token;
    });

    describe("/revenue (POST)", () => {
        it("Should create a new revenue for the logged user", async () => {
            await request(app.getHttpServer())
                .post("/revenue")
                .set("Authorization", `Bearer ${authToken}`)
                .send(revenue)
                .expect(201)
                .then((response) =>
                    expect(response.body.message).toBeDefined(),
                );
        });
    });

    describe("/revenue (GET)", () => {
        it("Should retrieve all revenues of the logged user", async () => {
            const result = await request(app.getHttpServer())
                .get("/revenue")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(result.body.length).toBe(1);
        });
    });

    describe("/revenue/:id (DELETE)", () => {
        let revenueId: number;

        it("Should delete a specific revenue of the logged user", async () => {
            // Retrieve all revenues to get the ID one
            const listResponse = await request(app.getHttpServer())
                .get("/revenue")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            revenueId = listResponse.body[listResponse.body.length - 1].id;

            // Now delete the revenue
            const deleteResponse = await request(app.getHttpServer())
                .delete(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(deleteResponse.body.message).toContain("deleted");
        });

        it("Should not allow deleting a revenue that was already deleted", async () => {
            // The second attempt must trigger 403 Forbidden
            await request(app.getHttpServer())
                .delete(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(403);
        });
    });

    describe("/revenue/:id (PATCH)", () => {
        let revenueId: number;

        beforeEach(async () => {
            // Create a fresh revenue for each test
            await request(app.getHttpServer())
                .post("/revenue")
                .set("Authorization", `Bearer ${authToken}`)
                .send(revenue)
                .expect(201);

            // Get the created revenue ID
            const listResponse = await request(app.getHttpServer())
                .get("/revenue")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            revenueId = listResponse.body[listResponse.body.length - 1].id;
        });

        it("Should update a single field (title)", async () => {
            const newTitle = "Updated Revenue Title";

            const response = await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: newTitle })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.revenue.title).toBe(newTitle);
            expect(response.body.revenue.description).toBe(revenue.description);
        });

        it("Should update multiple fields at once", async () => {
            const updates = {
                title: "New Revenue Title",
                description: "New Revenue Description",
                value: 2500.75,
            };

            const response = await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(updates)
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.revenue.title).toBe(updates.title);
            expect(response.body.revenue.description).toBe(updates.description);
            expect(response.body.revenue.value).toBe(updates.value);
        });

        it("Should update date field", async () => {
            const newDate = "2024-12-31";

            const response = await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ date: newDate })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.revenue.date).toBeDefined();
        });

        it("Should update recurrence field", async () => {
            const newRecurrence = 15;

            const response = await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ recurrence: newRecurrence })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.revenue.recurrence).toBe(newRecurrence);
        });

        it("Should update all fields", async () => {
            const updates = {
                title: "Completely New Revenue Title",
                description: "Completely New Revenue Description",
                date: "2025-06-15",
                value: 3000.0,
                recurrence: 14,
            };

            const response = await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(updates)
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.revenue.title).toBe(updates.title);
            expect(response.body.revenue.description).toBe(updates.description);
            expect(response.body.revenue.value).toBe(updates.value);
            expect(response.body.revenue.recurrence).toBe(updates.recurrence);
        });

        it("Should not return user field in response", async () => {
            const response = await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Test No User" })
                .expect(200);

            expect(response.body.revenue).not.toHaveProperty("user");
        });

        it("Should return 403 when updating revenue that doesn't belong to user", async () => {
            // Create another user
            const otherUser = generateTestUser(UserFormat.PASSWORD);
            await request(app.getHttpServer())
                .post("/auth/signup")
                .send(otherUser)
                .expect(201);

            // Login as other user
            const otherLoginResponse = await request(app.getHttpServer())
                .post("/auth/login")
                .send({
                    email: otherUser.email,
                    password: otherUser.password,
                })
                .expect(200);

            const otherAuthToken = otherLoginResponse.body.token;

            // Try to update the first user's revenue
            await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${otherAuthToken}`)
                .send({ title: "Hacked Revenue Title" })
                .expect(403)
                .then((response) => {
                    expect(response.body.message).toContain(
                        "does not belong to logged user",
                    );
                });
        });

        it("Should return 403 when updating non-existent revenue", async () => {
            await request(app.getHttpServer())
                .patch("/revenue/99999")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Non-existent" })
                .expect(403);
        });

        it("Should return 400 when sending invalid data", async () => {
            await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ value: "not-a-number" })
                .expect(400);
        });

        it("Should not update id or user fields even if provided", async () => {
            const response = await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "New Revenue Title",
                    id: 99999,
                    user: { id: 99999 },
                })
                .expect(200);

            expect(response.body.revenue.id).toBe(revenueId);
            expect(response.body.revenue.id).not.toBe(99999);
            expect(response.body.revenue).not.toHaveProperty("user");
        });

        it("Should require authentication", async () => {
            await request(app.getHttpServer())
                .patch(`/revenue/${revenueId}`)
                .send({ title: "Unauthorized Update" })
                .expect(401);
        });
    });
});

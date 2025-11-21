import { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
    generateTestFinancialGoal,
    generateTestModule,
    generateTestUser,
    UserFormat,
} from "../src/utils/test.util";

describe("FinancialGoalController (e2e)", () => {
    let app: INestApplication;
    const user = generateTestUser(UserFormat.PASSWORD);
    const financialGoal = generateTestFinancialGoal();

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

    describe("/financial-goal (POST)", () => {
        it("Should create a new financial goal for the logged user", async () => {
            await request(app.getHttpServer())
                .post("/financial-goal")
                .set("Authorization", `Bearer ${authToken}`)
                .send(financialGoal)
                .expect(201)
                .then((response) =>
                    expect(response.body.message).toBeDefined(),
                );
        });
    });

    describe("/financial-goal (GET)", () => {
        it("Should retrieve all financial goals of the logged user", async () => {
            const result = await request(app.getHttpServer())
                .get("/financial-goal")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(result.body.length).toBe(1);
        });
    });

    describe("/financial-goal/:id (DELETE)", () => {
        let financialGoalId: number;

        it("Should delete a specific financial goal of the logged user", async () => {
            // Retrieve all financial goals to get the ID one
            const listResponse = await request(app.getHttpServer())
                .get("/financial-goal")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            financialGoalId =
                listResponse.body[listResponse.body.length - 1].id;

            // Now delete the financial goal
            const deleteResponse = await request(app.getHttpServer())
                .delete(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(deleteResponse.body.message).toContain("deleted");
        });

        it("Should not allow deleting a financial goal that was already deleted", async () => {
            // The second attempt must trigger 403 Forbidden
            await request(app.getHttpServer())
                .delete(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(403);
        });
    });

    describe("/financial-goal/:id (PATCH)", () => {
        let financialGoalId: number;

        beforeEach(async () => {
            // Create a fresh financial goal for each test
            await request(app.getHttpServer())
                .post("/financial-goal")
                .set("Authorization", `Bearer ${authToken}`)
                .send(financialGoal)
                .expect(201);

            // Get the created financial goal ID
            const listResponse = await request(app.getHttpServer())
                .get("/financial-goal")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            financialGoalId =
                listResponse.body[listResponse.body.length - 1].id;
        });

        it("Should update a single field (description)", async () => {
            const newDescription = "Updated Financial Goal Description";

            const response = await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ description: newDescription })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.financialGoal.description).toBe(
                newDescription,
            );
            expect(response.body.financialGoal.value).toBe(financialGoal.value);
        });

        it("Should update multiple fields at once", async () => {
            const updates = {
                description: "New Financial Goal Description",
                value: 8000.0,
            };

            const response = await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(updates)
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.financialGoal.description).toBe(
                updates.description,
            );
            expect(response.body.financialGoal.value).toBe(updates.value);
        });

        it("Should update limitDate field", async () => {
            const newLimitDate = "2026-06-30";

            const response = await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ limitDate: newLimitDate })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.financialGoal.limitDate).toBeDefined();
        });

        it("Should update value field", async () => {
            const newValue = 12000.0;

            const response = await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ value: newValue })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.financialGoal.value).toBe(newValue);
        });

        it("Should update all fields", async () => {
            const updates = {
                description: "Completely New Financial Goal",
                limitDate: "2027-12-31",
                value: 20000.0,
            };

            const response = await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(updates)
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.financialGoal.description).toBe(
                updates.description,
            );
            expect(response.body.financialGoal.value).toBe(updates.value);
        });

        it("Should not return user field in response", async () => {
            const response = await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ description: "Test No User" })
                .expect(200);

            expect(response.body.financialGoal).not.toHaveProperty("user");
        });

        it("Should return 403 when updating financial goal that doesn't belong to user", async () => {
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

            // Try to update the first user's financial goal
            await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${otherAuthToken}`)
                .send({ description: "Hacked Description" })
                .expect(403)
                .then((response) => {
                    expect(response.body.message).toContain(
                        "does not belong to logged user",
                    );
                });
        });

        it("Should return 403 when updating non-existent financial goal", async () => {
            await request(app.getHttpServer())
                .patch("/financial-goal/99999")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ description: "Non-existent" })
                .expect(403);
        });

        it("Should return 400 when sending invalid data", async () => {
            await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ value: "not-a-number" })
                .expect(400);
        });

        it("Should not update id or user fields even if provided", async () => {
            const response = await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    description: "New Description",
                    id: 99999,
                    user: { id: 99999 },
                })
                .expect(200);

            expect(response.body.financialGoal.id).toBe(financialGoalId);
            expect(response.body.financialGoal.id).not.toBe(99999);
            expect(response.body.financialGoal).not.toHaveProperty("user");
        });

        it("Should require authentication", async () => {
            await request(app.getHttpServer())
                .patch(`/financial-goal/${financialGoalId}`)
                .send({ description: "Unauthorized Update" })
                .expect(401);
        });
    });
});

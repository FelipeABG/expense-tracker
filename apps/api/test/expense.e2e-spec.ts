import { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
    generateTestExpense,
    generateTestModule,
    generateTestUser,
    UserFormat,
} from "../src/utils/test.util";

describe("ExpenseController (e2e)", () => {
    let app: INestApplication;
    const user = generateTestUser(UserFormat.PASSWORD);
    const expense = generateTestExpense();

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

    describe("/expense (POST)", () => {
        it("Should create a new expense for the logged user", async () => {
            await request(app.getHttpServer())
                .post("/expense")
                .set("Authorization", `Bearer ${authToken}`)
                .send(expense)
                .expect(201)
                .then((response) =>
                    expect(response.body.message).toBeDefined(),
                );
        });
    });

    describe("/expense (GET)", () => {
        it("Should retrieve all expenses of the logged user", async () => {
            const result = await request(app.getHttpServer())
                .get("/expense")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(result.body.length).toBe(1);
        });
    });

    describe("/expense/:id (DELETE)", () => {
        let expenseId: number;

        it("Should delete a specific expense of the logged user", async () => {
            // Retrieve all expenses to get the ID one
            const listResponse = await request(app.getHttpServer())
                .get("/expense")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expenseId = listResponse.body[listResponse.body.length - 1].id;

            // Now delete the expense
            const deleteResponse = await request(app.getHttpServer())
                .delete(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expect(deleteResponse.body.message).toContain("deleted");
        });

        it("Should not allow deleting an expense that was already deleted", async () => {
            // The second attempt must trigger 403 Forbidden
            await request(app.getHttpServer())
                .delete(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .expect(403);
        });
    });

    describe("/expense/:id (PATCH)", () => {
        let expenseId: number;

        beforeEach(async () => {
            // Create a fresh expense for each test
            await request(app.getHttpServer())
                .post("/expense")
                .set("Authorization", `Bearer ${authToken}`)
                .send(expense)
                .expect(201);

            // Get the created expense ID
            const listResponse = await request(app.getHttpServer())
                .get("/expense")
                .set("Authorization", `Bearer ${authToken}`)
                .expect(200);

            expenseId = listResponse.body[listResponse.body.length - 1].id;
        });

        it("Should update a single field (title)", async () => {
            const newTitle = "Updated Title";

            const response = await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: newTitle })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.expense.title).toBe(newTitle);
            expect(response.body.expense.description).toBe(expense.description);
        });

        it("Should update multiple fields at once", async () => {
            const updates = {
                title: "New Title",
                description: "New Description",
                value: 999.99,
            };

            const response = await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(updates)
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.expense.title).toBe(updates.title);
            expect(response.body.expense.description).toBe(updates.description);
            expect(response.body.expense.value).toBe(updates.value);
        });

        it("Should update date field", async () => {
            const newDate = "2024-12-31";

            const response = await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ date: newDate })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.expense.date).toBeDefined();
        });

        it("Should update recurrence field", async () => {
            const newRecurrence = 30;

            const response = await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ recurrence: newRecurrence })
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.expense.recurrence).toBe(newRecurrence);
        });

        it("Should update all fields", async () => {
            const updates = {
                title: "Completely New Title",
                description: "Completely New Description",
                date: "2025-01-01",
                value: 1500.5,
                recurrence: 7,
            };

            const response = await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send(updates)
                .expect(200);

            expect(response.body.message).toContain("updated");
            expect(response.body.expense.title).toBe(updates.title);
            expect(response.body.expense.description).toBe(updates.description);
            expect(response.body.expense.value).toBe(updates.value);
            expect(response.body.expense.recurrence).toBe(updates.recurrence);
        });

        it("Should not return user field in response", async () => {
            const response = await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Test No User" })
                .expect(200);

            expect(response.body.expense).not.toHaveProperty("user");
        });

        it("Should return 403 when updating expense that doesn't belong to user", async () => {
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

            // Try to update the first user's expense
            await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${otherAuthToken}`)
                .send({ title: "Hacked Title" })
                .expect(403)
                .then((response) => {
                    expect(response.body.message).toContain(
                        "does not belong to logged user",
                    );
                });
        });

        it("Should return 403 when updating non-existent expense", async () => {
            await request(app.getHttpServer())
                .patch("/expense/99999")
                .set("Authorization", `Bearer ${authToken}`)
                .send({ title: "Non-existent" })
                .expect(403);
        });

        it("Should return 400 when sending invalid data", async () => {
            await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({ value: "not-a-number" })
                .expect(400);
        });

        it("Should not update id or user fields even if provided", async () => {
            const response = await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    title: "New Title",
                    id: 99999,
                    user: { id: 99999 },
                })
                .expect(200);

            expect(response.body.expense.id).toBe(expenseId);
            expect(response.body.expense.id).not.toBe(99999);
            expect(response.body.expense).not.toHaveProperty("user");
        });

        it("Should require authentication", async () => {
            await request(app.getHttpServer())
                .patch(`/expense/${expenseId}`)
                .send({ title: "Unauthorized Update" })
                .expect(401);
        });
    });
});

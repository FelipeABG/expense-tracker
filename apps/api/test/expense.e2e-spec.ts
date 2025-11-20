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
});

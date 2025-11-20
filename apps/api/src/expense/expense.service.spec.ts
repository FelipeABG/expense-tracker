import { User } from "src/user/user.entity";
import { UserService } from "../user/user.service";
import {
    generateTestExpense,
    generateTestModule,
    generateTestUser,
    UserFormat,
} from "../utils/test.util";
import { ExpenseService } from "./expense.service";
import { NotFoundException } from "@nestjs/common";

describe("Expense service", () => {
    let user: User;
    const expense = generateTestExpense();
    let expenseService: ExpenseService;

    beforeAll(async () => {
        const modRef = await generateTestModule();
        expenseService = modRef.get(ExpenseService);

        const userService = modRef.get(UserService);
        user = await userService.create(generateTestUser(UserFormat.HASH));
    });

    describe("create", () => {
        it("Should create a new expense in the db and return it", async () => {
            const result = await expenseService.create({
                user: { id: user.id },
                ...expense,
            });

            expect(result.title).toBe(expense.title);
            expect(result.description).toBe(expense.description);
        });

        it("Should fail if the user does not exist", async () => {
            await expect(
                expenseService.create({ user: { id: 5 }, ...expense }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("find", () => {
        it("Should retrieve all expenses based of find options", async () => {
            const result = await expenseService.find({
                where: { user: { id: user.id } },
            });

            expect(result.length).toBe(1);
        });

        it("Should return an empty list if nothing specified is found", async () => {
            const result = await expenseService.find({
                where: { user: { id: 4845 } },
            });

            expect(result.length).toBe(0);
        });
    });

    describe("delete", () => {
        let createdExpenseId: number;

        beforeAll(async () => {
            // Create an expense to delete
            const created = await expenseService.create({
                user: { id: user.id },
                ...expense,
            });

            createdExpenseId = created.id;
        });

        it("Should delete an existing expense", async () => {
            const result = await expenseService.delete(createdExpenseId);

            expect(result).toEqual({
                message: "Expense deleted successfully",
            });

            // Ensure it no longer exists
            const found = await expenseService.find({
                where: { id: createdExpenseId },
            });

            expect(found.length).toBe(0);
        });

        it("Should throw NotFoundException if deleting a non-existing expense", async () => {
            await expect(expenseService.delete(99999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe("update", () => {
        let createdExpenseId: number;
        const originalExpense = generateTestExpense();

        beforeEach(async () => {
            // Create a fresh expense for each test
            const created = await expenseService.create({
                user: { id: user.id },
                ...originalExpense,
            });
            createdExpenseId = created.id;
        });

        it("Should update a single field (title)", async () => {
            const newTitle = "Updated Title";
            const result = await expenseService.update(createdExpenseId, {
                title: newTitle,
            });

            expect(result.title).toBe(newTitle);
            expect(result.description).toBe(originalExpense.description);
            expect(result.value).toBe(originalExpense.value);
        });

        it("Should update multiple fields at once", async () => {
            const updates = {
                title: "New Title",
                description: "New Description",
                value: 999.99,
            };

            const result = await expenseService.update(
                createdExpenseId,
                updates,
            );

            expect(result.title).toBe(updates.title);
            expect(result.description).toBe(updates.description);
            expect(result.value).toBe(updates.value);
        });

        it("Should update date field", async () => {
            const newDate = "2024-12-31";
            const result = await expenseService.update(createdExpenseId, {
                date: newDate,
            });

            expect(result.date).toBeDefined();
            expect(String(result.date)).toContain("2024");
        });

        it("Should update recurrence field", async () => {
            const newRecurrence = 30;
            const result = await expenseService.update(createdExpenseId, {
                recurrence: newRecurrence,
            });

            expect(result.recurrence).toBe(newRecurrence);
        });

        it("Should update all fields", async () => {
            const updates = {
                title: "Completely New Title",
                description: "Completely New Description",
                date: "2025-01-01",
                value: 1500.5,
                recurrence: 7,
            };

            const result = await expenseService.update(
                createdExpenseId,
                updates,
            );

            expect(result.title).toBe(updates.title);
            expect(result.description).toBe(updates.description);
            expect(result.value).toBe(updates.value);
            expect(result.recurrence).toBe(updates.recurrence);
            expect(result.date).toBeDefined();
        });

        it("Should not return user in the response", async () => {
            const result = await expenseService.update(createdExpenseId, {
                title: "Test No User",
            });

            expect(result).not.toHaveProperty("user");
        });

        it("Should throw NotFoundException when updating non-existing expense", async () => {
            await expect(
                expenseService.update(99999, { title: "New Title" }),
            ).rejects.toThrow(NotFoundException);
        });

        it("Should handle empty update object", async () => {
            const result = await expenseService.update(createdExpenseId, {});

            // Should return the expense unchanged
            expect(result.title).toBe(originalExpense.title);
            expect(result.description).toBe(originalExpense.description);
            expect(result.value).toBe(originalExpense.value);
        });
    });
});

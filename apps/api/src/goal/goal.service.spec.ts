import { User } from "src/user/user.entity";
import { UserService } from "../user/user.service";
import {
    generateTestFinancialGoal,
    generateTestModule,
    generateTestUser,
    UserFormat,
} from "../utils/test.util";
import { FinancialGoalService } from "./goal.service";
import { NotFoundException } from "@nestjs/common";

describe("FinancialGoal service", () => {
    let user: User;
    const financialGoal = generateTestFinancialGoal();
    let financialGoalService: FinancialGoalService;

    beforeAll(async () => {
        const modRef = await generateTestModule();
        financialGoalService = modRef.get(FinancialGoalService);
        const userService = modRef.get(UserService);
        user = await userService.create(generateTestUser(UserFormat.HASH));
    });

    describe("create", () => {
        it("Should create a new financial goal in the db and return it", async () => {
            const result = await financialGoalService.create({
                user: { id: user.id },
                ...financialGoal,
            });
            expect(result.description).toBe(financialGoal.description);
            expect(result.value).toBe(financialGoal.value);
        });

        it("Should fail if the user does not exist", async () => {
            await expect(
                financialGoalService.create({
                    user: { id: 5 },
                    ...financialGoal,
                }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("find", () => {
        it("Should retrieve all financial goals based of find options", async () => {
            const result = await financialGoalService.find({
                where: { user: { id: user.id } },
            });
            expect(result.length).toBe(1);
        });

        it("Should return an empty list if nothing specified is found", async () => {
            const result = await financialGoalService.find({
                where: { user: { id: 4845 } },
            });
            expect(result.length).toBe(0);
        });
    });

    describe("delete", () => {
        let createdFinancialGoalId: number;

        beforeAll(async () => {
            // Create a financial goal to delete
            const created = await financialGoalService.create({
                user: { id: user.id },
                ...financialGoal,
            });
            createdFinancialGoalId = created.id;
        });

        it("Should delete an existing financial goal", async () => {
            const result = await financialGoalService.delete(
                createdFinancialGoalId,
            );
            expect(result).toEqual({
                message: "Financial goal deleted successfully",
            });

            // Ensure it no longer exists
            const found = await financialGoalService.find({
                where: { id: createdFinancialGoalId },
            });
            expect(found.length).toBe(0);
        });

        it("Should throw NotFoundException if deleting a non-existing financial goal", async () => {
            await expect(financialGoalService.delete(99999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe("update", () => {
        let createdFinancialGoalId: number;
        const originalFinancialGoal = generateTestFinancialGoal();

        beforeEach(async () => {
            // Create a fresh financial goal for each test
            const created = await financialGoalService.create({
                user: { id: user.id },
                ...originalFinancialGoal,
            });
            createdFinancialGoalId = created.id;
        });

        it("Should update a single field (description)", async () => {
            const newDescription = "Updated Description";
            const result = await financialGoalService.update(
                createdFinancialGoalId,
                {
                    description: newDescription,
                },
            );

            expect(result.description).toBe(newDescription);
            expect(result.value).toBe(originalFinancialGoal.value);
        });

        it("Should update multiple fields at once", async () => {
            const updates = {
                description: "New Description",
                value: 5000.0,
            };

            const result = await financialGoalService.update(
                createdFinancialGoalId,
                updates,
            );

            expect(result.description).toBe(updates.description);
            expect(result.value).toBe(updates.value);
        });

        it("Should update limitDate field", async () => {
            const newLimitDate = "2025-12-31";
            const result = await financialGoalService.update(
                createdFinancialGoalId,
                {
                    limitDate: newLimitDate,
                },
            );

            expect(result.limitDate).toBeDefined();
            expect(String(result.limitDate)).toContain("2025");
        });

        it("Should update value field", async () => {
            const newValue = 10000.0;
            const result = await financialGoalService.update(
                createdFinancialGoalId,
                {
                    value: newValue,
                },
            );

            expect(result.value).toBe(newValue);
        });

        it("Should update all fields", async () => {
            const updates = {
                description: "Completely New Financial Goal",
                limitDate: "2026-06-30",
                value: 15000.0,
            };

            const result = await financialGoalService.update(
                createdFinancialGoalId,
                updates,
            );

            expect(result.description).toBe(updates.description);
            expect(result.value).toBe(updates.value);
            expect(result.limitDate).toBeDefined();
        });

        it("Should not return user in the response", async () => {
            const result = await financialGoalService.update(
                createdFinancialGoalId,
                {
                    description: "Test No User",
                },
            );

            expect(result).not.toHaveProperty("user");
        });

        it("Should throw NotFoundException when updating non-existing financial goal", async () => {
            await expect(
                financialGoalService.update(99999, {
                    description: "New Description",
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it("Should handle empty update object", async () => {
            const result = await financialGoalService.update(
                createdFinancialGoalId,
                {},
            );

            // Should return the financial goal unchanged
            expect(result.description).toBe(originalFinancialGoal.description);
            expect(result.value).toBe(originalFinancialGoal.value);
        });
    });
});

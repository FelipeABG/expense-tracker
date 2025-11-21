import { User } from "src/user/user.entity";
import { UserService } from "../user/user.service";
import {
    generateTestRevenue,
    generateTestModule,
    generateTestUser,
    UserFormat,
} from "../utils/test.util";
import { RevenueService } from "./revenue.service";
import { NotFoundException } from "@nestjs/common";

describe("Revenue service", () => {
    let user: User;
    const revenue = generateTestRevenue();
    let revenueService: RevenueService;

    beforeAll(async () => {
        const modRef = await generateTestModule();
        revenueService = modRef.get(RevenueService);
        const userService = modRef.get(UserService);
        user = await userService.create(generateTestUser(UserFormat.HASH));
    });

    describe("create", () => {
        it("Should create a new revenue in the db and return it", async () => {
            const result = await revenueService.create({
                user: { id: user.id },
                ...revenue,
            });
            expect(result.title).toBe(revenue.title);
            expect(result.description).toBe(revenue.description);
        });

        it("Should fail if the user does not exist", async () => {
            await expect(
                revenueService.create({ user: { id: 5 }, ...revenue }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe("find", () => {
        it("Should retrieve all revenues based of find options", async () => {
            const result = await revenueService.find({
                where: { user: { id: user.id } },
            });
            expect(result.length).toBe(1);
        });

        it("Should return an empty list if nothing specified is found", async () => {
            const result = await revenueService.find({
                where: { user: { id: 4845 } },
            });
            expect(result.length).toBe(0);
        });
    });

    describe("delete", () => {
        let createdRevenueId: number;

        beforeAll(async () => {
            // Create a revenue to delete
            const created = await revenueService.create({
                user: { id: user.id },
                ...revenue,
            });
            createdRevenueId = created.id;
        });

        it("Should delete an existing revenue", async () => {
            const result = await revenueService.delete(createdRevenueId);
            expect(result).toEqual({
                message: "Revenue deleted successfully",
            });

            // Ensure it no longer exists
            const found = await revenueService.find({
                where: { id: createdRevenueId },
            });
            expect(found.length).toBe(0);
        });

        it("Should throw NotFoundException if deleting a non-existing revenue", async () => {
            await expect(revenueService.delete(99999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe("update", () => {
        let createdRevenueId: number;
        const originalRevenue = generateTestRevenue();

        beforeEach(async () => {
            // Create a fresh revenue for each test
            const created = await revenueService.create({
                user: { id: user.id },
                ...originalRevenue,
            });
            createdRevenueId = created.id;
        });

        it("Should update a single field (title)", async () => {
            const newTitle = "Updated Title";
            const result = await revenueService.update(createdRevenueId, {
                title: newTitle,
            });

            expect(result.title).toBe(newTitle);
            expect(result.description).toBe(originalRevenue.description);
            expect(result.value).toBe(originalRevenue.value);
        });

        it("Should update multiple fields at once", async () => {
            const updates = {
                title: "New Title",
                description: "New Description",
                value: 999.99,
            };

            const result = await revenueService.update(
                createdRevenueId,
                updates,
            );

            expect(result.title).toBe(updates.title);
            expect(result.description).toBe(updates.description);
            expect(result.value).toBe(updates.value);
        });

        it("Should update date field", async () => {
            const newDate = "2024-12-31";
            const result = await revenueService.update(createdRevenueId, {
                date: newDate,
            });

            expect(result.date).toBeDefined();
            expect(String(result.date)).toContain("2024");
        });

        it("Should update recurrence field", async () => {
            const newRecurrence = 30;
            const result = await revenueService.update(createdRevenueId, {
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

            const result = await revenueService.update(
                createdRevenueId,
                updates,
            );

            expect(result.title).toBe(updates.title);
            expect(result.description).toBe(updates.description);
            expect(result.value).toBe(updates.value);
            expect(result.recurrence).toBe(updates.recurrence);
            expect(result.date).toBeDefined();
        });

        it("Should not return user in the response", async () => {
            const result = await revenueService.update(createdRevenueId, {
                title: "Test No User",
            });

            expect(result).not.toHaveProperty("user");
        });

        it("Should throw NotFoundException when updating non-existing revenue", async () => {
            await expect(
                revenueService.update(99999, { title: "New Title" }),
            ).rejects.toThrow(NotFoundException);
        });

        it("Should handle empty update object", async () => {
            const result = await revenueService.update(createdRevenueId, {});

            // Should return the revenue unchanged
            expect(result.title).toBe(originalRevenue.title);
            expect(result.description).toBe(originalRevenue.description);
            expect(result.value).toBe(originalRevenue.value);
        });
    });
});

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

    describe("findAllForUser", () => {
        it("Should retrieve all expenses of specified user", async () => {
            const result = await expenseService.find({
                user: { id: user.id },
            });

            expect(result.length).toBe(1);
        });
    });
});

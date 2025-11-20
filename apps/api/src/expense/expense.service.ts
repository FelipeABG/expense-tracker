import { Injectable, NotFoundException } from "@nestjs/common";
import {
    DeepPartial,
    FindManyOptions,
    QueryFailedError,
    Repository,
} from "typeorm";
import { Expense } from "./expense.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ExpenseService {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepository: Repository<Expense>,
    ) {}

    async find(opts: FindManyOptions<Expense>) {
        // If no expenses are found returns empty array
        const expenses = await this.expenseRepository.find(opts);

        return expenses.map((expense) => {
            const { user, ...rest } = expense;
            return rest;
        });
    }

    async create(expense: DeepPartial<Expense>) {
        try {
            return await this.expenseRepository.save(expense);
        } catch (err) {
            if (err instanceof QueryFailedError) {
                const driverError: any = err.driverError;

                // PostgreSQL foreign key violation
                if (driverError.code === "23503") {
                    throw new NotFoundException(
                        "Specified user does not exist",
                    );
                }

                // SQLite foreign key violation (test)
                if (
                    driverError.message?.includes(
                        "FOREIGN KEY constraint failed",
                    )
                ) {
                    throw new NotFoundException(
                        "Specified user does not exist",
                    );
                }
            }

            throw err;
        }
    }

    async delete(id: number) {
        const expense = await this.expenseRepository.findOne({ where: { id } });

        if (!expense) {
            throw new NotFoundException("Expense not found");
        }

        await this.expenseRepository.remove(expense);

        return { message: "Expense deleted successfully" };
    }

    async update(id: number, changes: DeepPartial<Expense>) {
        const expense = await this.expenseRepository.findOne({ where: { id } });
        if (!expense) {
            throw new NotFoundException("Expense not found");
        }

        // Merge the expense changes
        Object.assign(expense, changes);
        const updatedExpense = await this.expenseRepository.save(expense);

        // Remove user from response
        const { user, ...rest } = updatedExpense;
        return rest;
    }
}

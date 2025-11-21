import { Injectable, NotFoundException } from "@nestjs/common";
import {
    DeepPartial,
    FindManyOptions,
    QueryFailedError,
    Repository,
} from "typeorm";
import { FinancialGoal } from "./goal.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class FinancialGoalService {
    constructor(
        @InjectRepository(FinancialGoal)
        private readonly financialGoalRepository: Repository<FinancialGoal>,
    ) {}

    async find(opts: FindManyOptions<FinancialGoal>) {
        // If no financial goals are found returns empty array
        const financialGoals = await this.financialGoalRepository.find(opts);
        return financialGoals.map((financialGoal) => {
            const { user, ...rest } = financialGoal;
            return rest;
        });
    }

    async create(financialGoal: DeepPartial<FinancialGoal>) {
        try {
            return await this.financialGoalRepository.save(financialGoal);
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
        const financialGoal = await this.financialGoalRepository.findOne({
            where: { id },
        });
        if (!financialGoal) {
            throw new NotFoundException("Financial goal not found");
        }
        await this.financialGoalRepository.remove(financialGoal);
        return { message: "Financial goal deleted successfully" };
    }

    async update(id: number, changes: DeepPartial<FinancialGoal>) {
        const financialGoal = await this.financialGoalRepository.findOne({
            where: { id },
        });
        if (!financialGoal) {
            throw new NotFoundException("Financial goal not found");
        }

        // Merge the financial goal changes
        Object.assign(financialGoal, changes);
        const updatedFinancialGoal =
            await this.financialGoalRepository.save(financialGoal);

        // Remove user from response
        const { user, ...rest } = updatedFinancialGoal;
        return rest;
    }
}

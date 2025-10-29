import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import {
    DeepPartial,
    FindOptionsWhere,
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

    async find(where: FindOptionsWhere<Expense>) {
        // If no expenses are found returns empty array
        const expenses = await this.expenseRepository.find({
            where,
            relations: { user: true },
        });

        return expenses.map((expense) => {
            // Removes roles and hash from the response
            const { hash, roles, ...rest } = expense.user;
            return { ...expense, user: rest };
        });
    }

    async create(expense: DeepPartial<Expense>) {
        try {
            return await this.expenseRepository.save(expense);
        } catch (err) {
            if (err instanceof QueryFailedError) {
                throw new NotFoundException("Specified user does not exist");
            }

            throw new InternalServerErrorException();
        }
    }
}

import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Expense } from "./expense.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ExpenseService {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepository: Repository<Expense>,
    ) {}
}

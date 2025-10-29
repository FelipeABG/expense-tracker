import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Expense } from "./expense.entity";
import { ExpenseService } from "./expense.service";

@Module({
    imports: [TypeOrmModule.forFeature([Expense])],
    providers: [ExpenseService],
    controllers: [],
    exports: [ExpenseService],
})
export class ExpenseModule {}

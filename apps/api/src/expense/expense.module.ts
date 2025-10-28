import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Expense } from "./expense.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Expense])],
    providers: [],
    controllers: [],
    exports: [],
})
export class ExpenseModule {}

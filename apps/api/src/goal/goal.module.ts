import { Module } from "@nestjs/common";
import { FinancialGoalController } from "./goal.controller";
import { FinancialGoalService } from "./goal.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FinancialGoal } from "./goal.entity";

@Module({
    imports: [TypeOrmModule.forFeature([FinancialGoal])],
    controllers: [FinancialGoalController],
    providers: [FinancialGoalService],
    exports: [FinancialGoalService],
})
export class FinancialGoalModule {}

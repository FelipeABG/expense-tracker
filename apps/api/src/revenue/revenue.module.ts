import { Module } from "@nestjs/common";
import { RevenueController } from "./revenue.controller";
import { RevenueService } from "./revenue.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Revenue } from "./revenue.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Revenue])],
    controllers: [RevenueController],
    providers: [RevenueService],
    exports: [RevenueService],
})
export class RevenueModule {}

import { Injectable, NotFoundException } from "@nestjs/common";
import {
    DeepPartial,
    FindManyOptions,
    QueryFailedError,
    Repository,
} from "typeorm";
import { Revenue } from "./revenue.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class RevenueService {
    constructor(
        @InjectRepository(Revenue)
        private readonly revenueRepository: Repository<Revenue>,
    ) {}

    async find(opts: FindManyOptions<Revenue>) {
        // If no revenues are found returns empty array
        const revenues = await this.revenueRepository.find(opts);
        return revenues.map((revenue) => {
            const { user, ...rest } = revenue;
            return rest;
        });
    }

    async create(revenue: DeepPartial<Revenue>) {
        try {
            return await this.revenueRepository.save(revenue);
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
        const revenue = await this.revenueRepository.findOne({ where: { id } });
        if (!revenue) {
            throw new NotFoundException("Revenue not found");
        }
        await this.revenueRepository.remove(revenue);
        return { message: "Revenue deleted successfully" };
    }

    async update(id: number, changes: DeepPartial<Revenue>) {
        const revenue = await this.revenueRepository.findOne({ where: { id } });
        if (!revenue) {
            throw new NotFoundException("Revenue not found");
        }

        // Merge the revenue changes
        Object.assign(revenue, changes);
        const updatedRevenue = await this.revenueRepository.save(revenue);

        // Remove user from response
        const { user, ...rest } = updatedRevenue;
        return rest;
    }
}

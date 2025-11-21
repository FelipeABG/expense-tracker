import { Controller, Req } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { contract } from "contract";
import { RevenueService } from "./revenue.service";
import { DeepPartial } from "typeorm";
import { Revenue } from "./revenue.entity";

@Controller()
export class RevenueController {
    constructor(private readonly revenueService: RevenueService) {}

    @TsRestHandler(contract.Revenue)
    async handler(@Req() req: Request) {
        return tsRestHandler(contract.Revenue, {
            getAllforUser: async () => {
                const id = req["user"].sub;
                const revenues = await this.revenueService.find({
                    where: { user: { id: id } },
                });
                return {
                    status: 200,
                    body: revenues.map((r) => ({
                        ...r,
                        date: String(r.date),
                    })),
                };
            },

            createForUser: async ({ body }) => {
                const id = req["user"].sub;
                await this.revenueService.create({
                    user: { id: id },
                    ...body,
                    date: body.date,
                });
                return {
                    status: 201,
                    body: {
                        message: `Revenue for user ${id} created successfully`,
                    },
                };
            },

            deleteForUser: async ({ params }) => {
                const userId = req["user"].sub;
                const revenueId = params.id;

                // Check if the revenue exists and belongs to the user
                const revenues = await this.revenueService.find({
                    where: { id: revenueId, user: { id: userId } },
                });

                if (revenues.length === 0) {
                    return {
                        status: 403,
                        body: {
                            message:
                                "This revenue does not belong to logged user",
                        },
                    };
                }

                // Delete the revenue
                await this.revenueService.delete(revenueId);
                return {
                    status: 200,
                    body: {
                        message: `Revenue ${revenueId} deleted successfully`,
                    },
                };
            },

            updateForUser: async ({ params, body }) => {
                const userId = req["user"].sub;
                const revenueId = params.id;

                // Check if the revenue exists and belongs to the user
                const revenues = await this.revenueService.find({
                    where: { id: revenueId, user: { id: userId } },
                });

                if (revenues.length === 0) {
                    return {
                        status: 403,
                        body: {
                            message:
                                "This revenue does not belong to logged user",
                        },
                    };
                }

                // Prepare changes object with only provided fields
                const changes: DeepPartial<Revenue> = {};

                if (body.title !== undefined) changes.title = body.title;
                if (body.description !== undefined)
                    changes.description = body.description;
                if (body.date !== undefined) changes.date = body.date;
                if (body.value !== undefined) changes.value = body.value;
                if (body.recurrence !== undefined)
                    changes.recurrence = body.recurrence;

                // Update the revenue
                const updatedRevenue = await this.revenueService.update(
                    revenueId,
                    changes,
                );

                return {
                    status: 200,
                    body: {
                        message: `Revenue ${revenueId} updated successfully`,
                        revenue: {
                            ...updatedRevenue,
                            date: String(updatedRevenue.date),
                        },
                    },
                };
            },
        });
    }
}

import { Controller, Req } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { contract } from "contract";
import { FinancialGoalService } from "./goal.service";
import { DeepPartial } from "typeorm";
import { FinancialGoal } from "./goal.entity";

@Controller()
export class FinancialGoalController {
    constructor(private readonly financialGoalService: FinancialGoalService) {}

    @TsRestHandler(contract.FinancialGoal)
    async handler(@Req() req: Request) {
        return tsRestHandler(contract.FinancialGoal, {
            getAllforUser: async () => {
                const id = req["user"].sub;
                const financialGoals = await this.financialGoalService.find({
                    where: { user: { id: id } },
                });
                return {
                    status: 200,
                    body: financialGoals.map((fg) => ({
                        ...fg,
                        limitDate: String(fg.limitDate),
                    })),
                };
            },

            createForUser: async ({ body }) => {
                const id = req["user"].sub;
                await this.financialGoalService.create({
                    user: { id: id },
                    ...body,
                    limitDate: body.limitDate,
                });
                return {
                    status: 201,
                    body: {
                        message: `Financial goal for user ${id} created successfully`,
                    },
                };
            },

            deleteForUser: async ({ params }) => {
                const userId = req["user"].sub;
                const financialGoalId = params.id;

                // Check if the  goal exists and belongs to the user
                const financialGoals = await this.financialGoalService.find({
                    where: { id: financialGoalId, user: { id: userId } },
                });

                if (financialGoals.length === 0) {
                    return {
                        status: 403,
                        body: {
                            message:
                                "This  goal does not belong to logged user",
                        },
                    };
                }

                // Delete the  goal
                await this.financialGoalService.delete(financialGoalId);
                return {
                    status: 200,
                    body: {
                        message: `Financial goal ${financialGoalId} deleted successfully`,
                    },
                };
            },

            updateForUser: async ({ params, body }) => {
                const userId = req["user"].sub;
                const financialGoalId = params.id;

                // Check if the  goal exists and belongs to the user
                const financialGoals = await this.financialGoalService.find({
                    where: { id: financialGoalId, user: { id: userId } },
                });

                if (financialGoals.length === 0) {
                    return {
                        status: 403,
                        body: {
                            message:
                                "This  goal does not belong to logged user",
                        },
                    };
                }

                // Prepare changes object with only provided fields
                const changes: DeepPartial<FinancialGoal> = {};

                if (body.description !== undefined)
                    changes.description = body.description;
                if (body.limitDate !== undefined)
                    changes.limitDate = body.limitDate;
                if (body.value !== undefined) changes.value = body.value;

                // Update the  goal
                const updatedFinancialGoal =
                    await this.financialGoalService.update(
                        financialGoalId,
                        changes,
                    );

                return {
                    status: 200,
                    body: {
                        message: `Financial goal ${financialGoalId} updated successfully`,
                        financialGoal: {
                            ...updatedFinancialGoal,
                            limitDate: String(updatedFinancialGoal.limitDate),
                        },
                    },
                };
            },
        });
    }
}

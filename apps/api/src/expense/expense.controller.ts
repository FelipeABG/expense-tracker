import { Controller, Req } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { contract } from "contract";
import { ExpenseService } from "./expense.service";
import { DeepPartial } from "typeorm";
import { Expense } from "./expense.entity";

@Controller()
export class ExpenseController {
    constructor(private readonly expenseService: ExpenseService) {}

    @TsRestHandler(contract.Expense)
    async handler(@Req() req: Request) {
        return tsRestHandler(contract.Expense, {
            getAllforUser: async () => {
                const id = req["user"].sub;
                const expenses = await this.expenseService.find({
                    where: { user: { id: id } },
                });

                return {
                    status: 200,
                    body: expenses.map((e) => ({
                        ...e,
                        date: String(e.date),
                    })),
                };
            },
            createForUser: async ({ body }) => {
                const id = req["user"].sub;
                await this.expenseService.create({
                    user: { id: id },
                    ...body,
                    date: body.date,
                });
                return {
                    status: 201,
                    body: {
                        message: `Expense for user ${id} created successfully`,
                    },
                };
            },
            deleteForUser: async ({ params }) => {
                const userId = req["user"].sub;
                const expenseId = params.id;

                //Check if the expense exists and belongs to the user
                const expenses = await this.expenseService.find({
                    where: { id: expenseId, user: { id: userId } },
                });

                if (expenses.length === 0) {
                    return {
                        status: 403,
                        body: {
                            message:
                                "This expense does not belong to logged user",
                        },
                    };
                }

                // Delete the expense
                await this.expenseService.delete(expenseId);

                return {
                    status: 200,
                    body: {
                        message: `Expense ${expenseId} deleted successfully`,
                    },
                };
            },
            updateForUser: async ({ params, body }) => {
                const userId = req["user"].sub;
                const expenseId = params.id;

                // Check if the expense exists and belongs to the user
                const expenses = await this.expenseService.find({
                    where: { id: expenseId, user: { id: userId } },
                });

                if (expenses.length === 0) {
                    return {
                        status: 403,
                        body: {
                            message:
                                "This expense does not belong to logged user",
                        },
                    };
                }

                // Prepare changes object with only provided fields
                const changes: DeepPartial<Expense> = {};

                if (body.title !== undefined) changes.title = body.title;
                if (body.description !== undefined)
                    changes.description = body.description;
                if (body.date !== undefined) changes.date = body.date;
                if (body.value !== undefined) changes.value = body.value;
                if (body.recurrence !== undefined)
                    changes.recurrence = body.recurrence;

                // Update the expense
                const updatedExpense = await this.expenseService.update(
                    expenseId,
                    changes,
                );

                return {
                    status: 200,
                    body: {
                        message: `Expense ${expenseId} updated successfully`,
                        expense: {
                            ...updatedExpense,
                            date: String(updatedExpense.date),
                        },
                    },
                };
            },
        });
    }
}

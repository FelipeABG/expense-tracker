import { Controller, Req } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { contract } from "contract";
import { ExpenseService } from "./expense.service";

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
        });
    }
}

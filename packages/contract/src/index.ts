import { initContract } from "@ts-rest/core";
import { authContract } from "./auth.contract";
import { userContract } from "./user.contract";
import { expenseContract } from "./expense.contract";
import { revenueContract } from "./revenue.contract";

const c = initContract();

export const contract = c.router(
    {
        Authentication: authContract,
        User: userContract,
        Expense: expenseContract,
        Revenue: revenueContract,
    },
    { strictStatusCodes: true },
);

import { initContract } from "@ts-rest/core";
import { authContract } from "./auth.contract";
import { userContract } from "./user.contract";
import { expenseContract } from "./expense.contract";

const c = initContract();

export const contract = c.router(
    {
        Authentication: authContract,
        User: userContract,
        Expense: expenseContract,
    },
    { strictStatusCodes: true },
);

import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
    InternalErrorResponse,
    BadRequestResponse,
    ForbiddenResponse,
} from "./response";
import { ExpenseSchema } from "./schemas/expense.schema";

const c = initContract();

export const expenseContract = c.router(
    {
        getAllforUser: {
            method: "GET",
            path: "/",
            summary: "Get all expenses of the logged user",
            description:
                "Retrieve all expenses of the logged user through its token information",
            responses: {
                200: ExpenseSchema.omit({ user: true }).array(),
                ...InternalErrorResponse,
            },
        },

        createForUser: {
            method: "POST",
            path: "/",
            summary: "Create a new expense for the logged user",
            description:
                "Create a new expense of the logged user with body information",
            body: ExpenseSchema.omit({ user: true, id: true }),
            responses: {
                201: z.object({ message: z.string() }),
                ...BadRequestResponse,
                ...InternalErrorResponse,
            },
        },

        deleteForUser: {
            method: "DELETE",
            path: "/:id",
            summary: "Delete the specified expense of the logged user",
            description:
                "Delete the specified expense of the logged user. If the given expense is not from the user, a forbidden message is returned",
            pathParams: z.object({ id: z.coerce.number().positive() }),
            responses: {
                200: z.object({ message: z.string() }),
                ...BadRequestResponse,
                ...ForbiddenResponse,
                ...InternalErrorResponse,
            },
        },
    },
    { pathPrefix: "/expense" },
);

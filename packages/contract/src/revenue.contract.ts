import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
    InternalErrorResponse,
    BadRequestResponse,
    ForbiddenResponse,
} from "./response";
import { RevenueSchema } from "./schemas/revenue.schema";

const c = initContract();

export const revenueContract = c.router(
    {
        getAllforUser: {
            method: "GET",
            path: "/",
            summary: "Get all revenues of the logged user",
            description:
                "Retrieve all revenues of the logged user through its token information",
            responses: {
                200: RevenueSchema.omit({ user: true }).array(),
                ...InternalErrorResponse,
            },
        },

        createForUser: {
            method: "POST",
            path: "/",
            summary: "Create a new revenue for the logged user",
            description:
                "Create a new revenue of the logged user with body information",
            body: RevenueSchema.omit({ user: true, id: true }),
            responses: {
                201: z.object({ message: z.string() }),
                ...BadRequestResponse,
                ...InternalErrorResponse,
            },
        },

        deleteForUser: {
            method: "DELETE",
            path: "/:id",
            summary: "Delete the specified revenue of the logged user",
            description:
                "Delete the specified revenue of the logged user. If the given revenue is not from the user, a forbidden message is returned",
            pathParams: z.object({ id: z.coerce.number().positive() }),
            responses: {
                200: z.object({ message: z.string() }),
                ...BadRequestResponse,
                ...ForbiddenResponse,
                ...InternalErrorResponse,
            },
        },

        updateForUser: {
            method: "PATCH",
            path: "/:id",
            summary: "Update the specified revenue of the logged user",
            description:
                "Update the specified revenue of the logged user. If the given revenue is not from the user, a forbidden message is returned. Only provided fields will be updated.",
            pathParams: z.object({ id: z.coerce.number().positive() }),
            body: RevenueSchema.omit({ user: true, id: true }).partial(),
            responses: {
                200: z.object({
                    message: z.string(),
                    revenue: RevenueSchema.omit({ user: true }),
                }),
                403: z.object({
                    message: z.string(),
                }),
                404: z.object({
                    message: z.string(),
                }),
                ...BadRequestResponse,
                ...InternalErrorResponse,
            },
        },
    },
    { pathPrefix: "/revenue" },
);

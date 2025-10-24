import { z } from "zod";

export const InternalErrorResponse = {
    500: z
        .object({
            message: z.string(),
        })
        .describe("Internal server error."),
};

export const BadRequestResponse = {
    400: z
        .object({
            bodyResult: z.object({
                issues: z.array(z.object({})),
                name: z.string(),
            }),
            headerResult: z.object({
                issues: z.array(z.object({})),
                name: z.string(),
            }),
            paramsResult: z.object({
                issues: z.array(z.object({})),
                name: z.string(),
            }),
            queryResult: z.object({
                issues: z.array(z.object({})),
                name: z.string(),
            }),
        })
        .describe("Request body, query, or parameters failed validation."),
};

export const ForbiddenResponse = {
    403: z
        .object({
            message: z.string(),
        })
        .describe("Insufficient privileges"),
};

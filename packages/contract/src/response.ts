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
            bodyResult: z.array(z.object({ issues: z.array(z.object({})) })),
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

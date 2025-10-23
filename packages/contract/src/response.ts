import { z } from "zod";

export const InternalServerResponse = {
    500: z
        .object({
            message: z.string(),
        })
        .describe("Internal server error."),
};

export const BadRequestServerResponse = {
    400: z
        .object({
            message: z.string(),
        })
        .describe("Request body, query, or parameters failed validation."),
};

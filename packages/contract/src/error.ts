import { z } from "zod";

export const InternalServerResponse = {
    500: z.object({
        message: z.string(),
    }),
};

export const INTERNAL_SERVER_ERROR = {
    status: 500 as const,
    body: { message: "Internal server error" },
};

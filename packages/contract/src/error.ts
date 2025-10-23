import { z } from "zod";

export const InternalServerResponse = {
    500: z.object({
        message: z.string(),
    }),
};

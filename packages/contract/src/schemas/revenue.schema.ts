import { z } from "zod";
import { UserSchema } from "./user.schema";

export const RevenueSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    value: z.number().positive(),
    recurrence: z.number().optional(),
    user: UserSchema.omit({ password: true }),
});

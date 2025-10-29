import { z } from "zod";
import { UserSchema } from "./user.schema";

export const ExpenseSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    date: z.date(),
    recurrance: z.number().nullable(),
    user: UserSchema.omit({ password: true }),
});

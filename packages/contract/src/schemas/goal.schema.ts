import { z } from "zod";
import { UserSchema } from "./user.schema";

export const FinancialGoalSchema = z.object({
    id: z.number(),
    description: z.string(),
    value: z.number().positive(),
    limitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    user: UserSchema.omit({ password: true }),
});

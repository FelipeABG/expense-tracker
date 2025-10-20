import * as z from "zod";

export const UserSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    password: z.string(),
    role: z.enum(["User", "Admin"]),
});

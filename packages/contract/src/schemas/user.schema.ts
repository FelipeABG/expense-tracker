import * as z from "zod";

export const UserSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
            /[^a-zA-Z0-9]/,
            "Password must contain at least one special character",
        ),
    roles: z.enum(["User", "Admin"]),
});

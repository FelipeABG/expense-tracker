import * as z from "zod";
export declare const UserSchema: z.ZodObject<{
    id: z.ZodNumber;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["User", "Admin"]>;
}, "strip", z.ZodTypeAny, {
    id: number;
    email: string;
    password: string;
    role: "User" | "Admin";
}, {
    id: number;
    email: string;
    password: string;
    role: "User" | "Admin";
}>;

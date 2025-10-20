import { z } from "zod";
export declare const authContract: {
    login: {
        summary: "Log a user into the system.";
        description: "Authenticate user with email and password, returning JWT token.";
        method: "POST";
        body: z.ZodObject<Omit<{
            id: z.ZodNumber;
            email: z.ZodString;
            password: z.ZodString;
            role: z.ZodEnum<["User", "Admin"]>;
        }, "id" | "role">, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
        path: "/auth/login";
        responses: {
            200: z.ZodObject<{
                message: z.ZodString;
                token: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
                token: string;
            }, {
                message: string;
                token: string;
            }>;
            400: z.ZodObject<{
                message: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                message: string[];
            }, {
                message: string[];
            }>;
            401: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
            404: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
        };
    };
    signup: {
        summary: "Log a user into the system.";
        description: "Authenticate user with email and password, returning JWT token.";
        method: "POST";
        body: z.ZodObject<Omit<{
            id: z.ZodNumber;
            email: z.ZodString;
            password: z.ZodString;
            role: z.ZodEnum<["User", "Admin"]>;
        }, "id" | "role">, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
        path: "/auth/signup";
        responses: {
            201: z.ZodObject<{
                message: z.ZodString;
                user: z.ZodObject<Omit<{
                    id: z.ZodNumber;
                    email: z.ZodString;
                    password: z.ZodString;
                    role: z.ZodEnum<["User", "Admin"]>;
                }, "password">, "strip", z.ZodTypeAny, {
                    id: number;
                    email: string;
                    role: "User" | "Admin";
                }, {
                    id: number;
                    email: string;
                    role: "User" | "Admin";
                }>;
            }, "strip", z.ZodTypeAny, {
                message: string;
                user: {
                    id: number;
                    email: string;
                    role: "User" | "Admin";
                };
            }, {
                message: string;
                user: {
                    id: number;
                    email: string;
                    role: "User" | "Admin";
                };
            }>;
            400: z.ZodObject<{
                message: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                message: string[];
            }, {
                message: string[];
            }>;
        };
    };
};

import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { UserSchema } from "./schemas/user.schema";

const c = initContract();

export const authContract = c.router(
    {
        login: {
            method: "POST",
            path: "/login",
            summary: "Log a user into the system.",
            description:
                "Authenticate user with email and password, returning JWT token.",
            body: UserSchema.omit({ id: true, role: true }),
            responses: {
                200: z
                    .object({
                        message: z.string(),
                        token: z.string().jwt(),
                    })
                    .describe("User successfuly logged in."),
                400: z
                    .object({
                        message: z.string().array(),
                    })
                    .describe("Email and/or password is invalid."),
                401: z
                    .object({
                        message: z.string(),
                    })
                    .describe("Password is incorrect."),
                404: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User not found in the system."),
            },
        },
        signup: {
            method: "POST",
            path: "/signup",
            summary: "Log a user into the system.",
            description:
                "Authenticate user with email and password, returning JWT token.",
            body: UserSchema.omit({ id: true, role: true }),
            responses: {
                201: z
                    .object({
                        message: z.string(),
                        user: UserSchema.omit({ password: true }),
                    })
                    .describe("User successfuly created."),
                400: z
                    .object({
                        message: z.string().array(),
                    })
                    .describe("Email and/or password is invalid."),
            },
        },
    },
    { pathPrefix: "/auth" },
);

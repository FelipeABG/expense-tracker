import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { UserSchema } from "./schemas/user.schema";
import { InternalServerResponse, BadRequestServerResponse } from "./response";

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
                401: z
                    .object({
                        message: z.string(),
                    })
                    .describe("Invalid credentials."),
                404: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User not found in the system."),
                ...InternalServerResponse,
                ...BadRequestServerResponse,
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
                    })
                    .describe("User successfuly created."),
                409: z
                    .object({
                        message: z.string(),
                    })
                    .describe("Email already registered"),
                ...InternalServerResponse,
                ...BadRequestServerResponse,
            },
        },
    },
    { pathPrefix: "/auth" },
);

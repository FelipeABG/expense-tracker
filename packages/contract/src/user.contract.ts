import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { UserSchema } from "./schemas/user.schema";

const c = initContract();

export const userContract = c.router(
    {
        create: {
            method: "POST",
            path: "",
            summary: "Create a new user.",
            description:
                "Create a new user in the system, returning the created user. If the user already exists, returns 400 http code.",
            body: UserSchema.omit({ id: true, role: true }),
            responses: {
                201: z
                    .object({
                        message: z.string(),
                        user: UserSchema.omit({
                            role: true,
                            password: true,
                        }),
                    })
                    .describe("User successfully created."),
                400: z
                    .object({ message: z.string().array() })
                    .describe("Invalid email and/or password."),
                401: z
                    .object({ message: z.string() })
                    .describe(
                        "You must be authenticated to access this endpoint.",
                    ),
                403: z
                    .object({ message: z.string() })
                    .describe(
                        "You do not have the required role to access this endpoint.",
                    ),
            },
        },
        getAll: {
            method: "GET",
            path: "",
            summary: "Retrieve all users.",
            description:
                "Returns a list with all the users in the system. If there are no users, returns an empty list. **OBS**: You can optionally pass `limit` and `offset` as query parameters to paginate the response.",
            query: z
                .object({
                    limit: z.coerce.number().default(100),
                    offset: z.coerce.number().default(0),
                })
                .optional()
                .describe("Pagination query parameters."),
            responses: {
                200: z
                    .object({
                        message: z.string(),
                        users: UserSchema.omit({ password: true }).array(),
                    })
                    .describe("Successfully returned the user list."),
                401: z
                    .object({ message: z.string() })
                    .describe(
                        "You must be authenticated to access this endpoint.",
                    ),
                403: z
                    .object({ message: z.string() })
                    .describe(
                        "You do not have the required role to access this endpoint.",
                    ),
            },
        },
        deleteById: {
            method: "DELETE",
            path: "/:id",
            summary: "Delete an user by it's id.",
            description:
                "Delete an user by it's id. If there is no such user, returns 404 http code.",
            pathParams: z.object({
                id: z.number(),
            }),
            responses: {},
        },
        deleteByEmail: {
            method: "DELETE",
            path: "/by-email/:email",
            summary: "Delete an user by it's email.",
            description:
                "Delete an user by it's email. if there is no such user, returns 404 http code.",
            pathParams: z.object({
                email: z.string().email(),
            }),
            responses: {},
        },
    },
    { pathPrefix: "/users" },
);

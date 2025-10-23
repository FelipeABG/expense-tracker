import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { UserSchema } from "./schemas/user.schema";
import {
    BadRequestResponse,
    ForbiddenResponse,
    InternalErrorResponse,
} from "./response";

const c = initContract();

export const userContract = c.router(
    {
        create: {
            method: "POST",
            path: "",
            summary: "Create a new user.",
            description:
                "Create a new user in the system, returning the created user. If the user already exists, returns 409 http code.",
            body: UserSchema.omit({ id: true, roles: true }),
            responses: {
                201: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User successfully created."),
                409: z.object({
                    message: z.string(),
                }),
                ...BadRequestResponse,
                ...ForbiddenResponse,
                ...InternalErrorResponse,
            },
        },

        getById: {
            method: "GET",
            path: "/:id",
            summary: "Retrive an user by it's id.",
            description:
                "Retrive an user by it's id. If there is no such user, returns 404 http code.",
            pathParams: z.object({
                id: z.number(),
            }),
            responses: {
                200: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User successfully retrieved."),
                404: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User not found in the system."),
                ...BadRequestResponse,
                ...ForbiddenResponse,
                ...InternalErrorResponse,
            },
        },

        getByEmail: {
            method: "GET",
            path: "/by-email/:email",
            summary: "Retrive an user by it's email.",
            description:
                "Retrieve an user by it's email. if there is no such user, returns 404 http code.",
            pathParams: z.object({
                email: z.string().email(),
            }),
            responses: {
                200: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User successfully retrieved."),
                404: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User not found in the system."),
                ...BadRequestResponse,
                ...ForbiddenResponse,
                ...InternalErrorResponse,
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
                ...ForbiddenResponse,
                ...InternalErrorResponse,
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
            responses: {
                200: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User successfully deleted."),
                404: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User not found in the system."),
                ...BadRequestResponse,
                ...ForbiddenResponse,
                ...InternalErrorResponse,
            },
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
            responses: {
                200: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User successfully deleted."),
                404: z
                    .object({
                        message: z.string(),
                    })
                    .describe("User not found in the system."),
                ...BadRequestResponse,
                ...ForbiddenResponse,
                ...InternalErrorResponse,
            },
        },
    },
    { pathPrefix: "/users" },
);

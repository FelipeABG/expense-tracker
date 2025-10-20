import { z } from "zod";
export declare const userContract: {
    create: {
        summary: "Create a new user.";
        description: "Create a new user in the system, returning the created user. If the user already exists, returns 400 http code.";
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
        path: "/users";
        responses: {
            201: z.ZodObject<{
                message: z.ZodString;
                user: z.ZodObject<Omit<{
                    id: z.ZodNumber;
                    email: z.ZodString;
                    password: z.ZodString;
                    role: z.ZodEnum<["User", "Admin"]>;
                }, "password" | "role">, "strip", z.ZodTypeAny, {
                    id: number;
                    email: string;
                }, {
                    id: number;
                    email: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                message: string;
                user: {
                    id: number;
                    email: string;
                };
            }, {
                message: string;
                user: {
                    id: number;
                    email: string;
                };
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
            403: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
        };
    };
    getAll: {
        query: z.ZodOptional<z.ZodObject<{
            limit: z.ZodDefault<z.ZodNumber>;
            offset: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            offset: number;
        }, {
            limit?: number | undefined;
            offset?: number | undefined;
        }>>;
        summary: "Retrieve all users.";
        description: "Returns a list with all the users in the system. If there are no users, returns an empty list. **OBS**: You can optionally pass `limit` and `offset` as query parameters to paginate the response.";
        method: "GET";
        path: "/users";
        responses: {
            200: z.ZodObject<{
                message: z.ZodString;
                users: z.ZodArray<z.ZodObject<Omit<{
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
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                message: string;
                users: {
                    id: number;
                    email: string;
                    role: "User" | "Admin";
                }[];
            }, {
                message: string;
                users: {
                    id: number;
                    email: string;
                    role: "User" | "Admin";
                }[];
            }>;
            401: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
            403: z.ZodObject<{
                message: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                message: string;
            }, {
                message: string;
            }>;
        };
    };
    deleteById: {
        pathParams: z.ZodObject<{
            id: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: number;
        }, {
            id: number;
        }>;
        summary: "Delete an user by it's id.";
        description: "Delete an user by it's id. If there is no such user, returns 404 http code.";
        method: "DELETE";
        path: "/users/:id";
        responses: {};
    };
    deleteByEmail: {
        pathParams: z.ZodObject<{
            email: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
        }, {
            email: string;
        }>;
        summary: "Delete an user by it's email.";
        description: "Delete an user by it's email. if there is no such user, returns 404 http code.";
        method: "DELETE";
        path: "/users/by-email/:email";
        responses: {};
    };
};

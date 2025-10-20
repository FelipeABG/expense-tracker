export declare const contract: {
    Authentication: {
        login: {
            summary: "Log a user into the system.";
            description: "Authenticate user with email and password, returning JWT token.";
            method: "POST";
            body: import("zod").ZodObject<Omit<{
                id: import("zod").ZodNumber;
                email: import("zod").ZodString;
                password: import("zod").ZodString;
                role: import("zod").ZodEnum<["User", "Admin"]>;
            }, "id" | "role">, "strip", import("zod").ZodTypeAny, {
                email: string;
                password: string;
            }, {
                email: string;
                password: string;
            }>;
            path: "/auth/login";
            responses: {
                200: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                    token: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                    token: string;
                }, {
                    message: string;
                    token: string;
                }>;
                400: import("zod").ZodObject<{
                    message: import("zod").ZodArray<import("zod").ZodString, "many">;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string[];
                }, {
                    message: string[];
                }>;
                401: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
                404: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
            };
            strictStatusCodes: true;
        };
        signup: {
            summary: "Log a user into the system.";
            description: "Authenticate user with email and password, returning JWT token.";
            method: "POST";
            body: import("zod").ZodObject<Omit<{
                id: import("zod").ZodNumber;
                email: import("zod").ZodString;
                password: import("zod").ZodString;
                role: import("zod").ZodEnum<["User", "Admin"]>;
            }, "id" | "role">, "strip", import("zod").ZodTypeAny, {
                email: string;
                password: string;
            }, {
                email: string;
                password: string;
            }>;
            path: "/auth/signup";
            responses: {
                201: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                    user: import("zod").ZodObject<Omit<{
                        id: import("zod").ZodNumber;
                        email: import("zod").ZodString;
                        password: import("zod").ZodString;
                        role: import("zod").ZodEnum<["User", "Admin"]>;
                    }, "password">, "strip", import("zod").ZodTypeAny, {
                        id: number;
                        email: string;
                        role: "User" | "Admin";
                    }, {
                        id: number;
                        email: string;
                        role: "User" | "Admin";
                    }>;
                }, "strip", import("zod").ZodTypeAny, {
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
                400: import("zod").ZodObject<{
                    message: import("zod").ZodArray<import("zod").ZodString, "many">;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string[];
                }, {
                    message: string[];
                }>;
            };
            strictStatusCodes: true;
        };
    };
    User: {
        create: {
            summary: "Create a new user.";
            description: "Create a new user in the system, returning the created user. If the user already exists, returns 400 http code.";
            method: "POST";
            body: import("zod").ZodObject<Omit<{
                id: import("zod").ZodNumber;
                email: import("zod").ZodString;
                password: import("zod").ZodString;
                role: import("zod").ZodEnum<["User", "Admin"]>;
            }, "id" | "role">, "strip", import("zod").ZodTypeAny, {
                email: string;
                password: string;
            }, {
                email: string;
                password: string;
            }>;
            path: "/users";
            responses: {
                201: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                    user: import("zod").ZodObject<Omit<{
                        id: import("zod").ZodNumber;
                        email: import("zod").ZodString;
                        password: import("zod").ZodString;
                        role: import("zod").ZodEnum<["User", "Admin"]>;
                    }, "password" | "role">, "strip", import("zod").ZodTypeAny, {
                        id: number;
                        email: string;
                    }, {
                        id: number;
                        email: string;
                    }>;
                }, "strip", import("zod").ZodTypeAny, {
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
                400: import("zod").ZodObject<{
                    message: import("zod").ZodArray<import("zod").ZodString, "many">;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string[];
                }, {
                    message: string[];
                }>;
                401: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
                403: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
            };
            strictStatusCodes: true;
        };
        getAll: {
            query: import("zod").ZodOptional<import("zod").ZodObject<{
                limit: import("zod").ZodDefault<import("zod").ZodNumber>;
                offset: import("zod").ZodDefault<import("zod").ZodNumber>;
            }, "strip", import("zod").ZodTypeAny, {
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
                200: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                    users: import("zod").ZodArray<import("zod").ZodObject<Omit<{
                        id: import("zod").ZodNumber;
                        email: import("zod").ZodString;
                        password: import("zod").ZodString;
                        role: import("zod").ZodEnum<["User", "Admin"]>;
                    }, "password">, "strip", import("zod").ZodTypeAny, {
                        id: number;
                        email: string;
                        role: "User" | "Admin";
                    }, {
                        id: number;
                        email: string;
                        role: "User" | "Admin";
                    }>, "many">;
                }, "strip", import("zod").ZodTypeAny, {
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
                401: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
                403: import("zod").ZodObject<{
                    message: import("zod").ZodString;
                }, "strip", import("zod").ZodTypeAny, {
                    message: string;
                }, {
                    message: string;
                }>;
            };
            strictStatusCodes: true;
        };
        deleteById: {
            pathParams: import("zod").ZodObject<{
                id: import("zod").ZodNumber;
            }, "strip", import("zod").ZodTypeAny, {
                id: number;
            }, {
                id: number;
            }>;
            summary: "Delete an user by it's id.";
            description: "Delete an user by it's id. If there is no such user, returns 404 http code.";
            method: "DELETE";
            path: "/users/:id";
            responses: {};
            strictStatusCodes: true;
        };
        deleteByEmail: {
            pathParams: import("zod").ZodObject<{
                email: import("zod").ZodString;
            }, "strip", import("zod").ZodTypeAny, {
                email: string;
            }, {
                email: string;
            }>;
            summary: "Delete an user by it's email.";
            description: "Delete an user by it's email. if there is no such user, returns 404 http code.";
            method: "DELETE";
            path: "/users/by-email/:email";
            responses: {};
            strictStatusCodes: true;
        };
    };
};

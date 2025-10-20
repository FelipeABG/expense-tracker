"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authContract = void 0;
var core_1 = require("@ts-rest/core");
var zod_1 = require("zod");
var user_schema_1 = require("./schemas/user.schema");
var c = (0, core_1.initContract)();
exports.authContract = c.router({
    login: {
        method: "POST",
        path: "/login",
        summary: "Log a user into the system.",
        description: "Authenticate user with email and password, returning JWT token.",
        body: user_schema_1.UserSchema.omit({ id: true, role: true }),
        responses: {
            200: zod_1.z
                .object({
                message: zod_1.z.string(),
                token: zod_1.z.string().jwt(),
            })
                .describe("User successfuly logged in."),
            400: zod_1.z
                .object({
                message: zod_1.z.string().array(),
            })
                .describe("Email and/or password is invalid."),
            401: zod_1.z
                .object({
                message: zod_1.z.string(),
            })
                .describe("Password is incorrect."),
            404: zod_1.z
                .object({
                message: zod_1.z.string(),
            })
                .describe("User not found in the system."),
        },
    },
    signup: {
        method: "POST",
        path: "/signup",
        summary: "Log a user into the system.",
        description: "Authenticate user with email and password, returning JWT token.",
        body: user_schema_1.UserSchema.omit({ id: true, role: true }),
        responses: {
            201: zod_1.z
                .object({
                message: zod_1.z.string(),
                user: user_schema_1.UserSchema.omit({ password: true }),
            })
                .describe("User successfuly created."),
            400: zod_1.z
                .object({
                message: zod_1.z.string().array(),
            })
                .describe("Email and/or password is invalid."),
        },
    },
}, { pathPrefix: "/auth" });

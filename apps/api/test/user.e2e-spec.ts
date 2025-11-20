import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { UserService } from "../src/user/user.service";
import { Role } from "../src/role/role.enum";
import bcrypt from "bcryptjs";
import {
    generateTestModule,
    generateTestUser,
    UserFormat,
} from "../src/utils/test.util";

describe("UserController (e2e)", () => {
    let app: INestApplication<App>;
    let userToken: string;
    let adminToken: string;
    const user = generateTestUser(UserFormat.PASSWORD);
    const admin = generateTestUser(UserFormat.PASSWORD);
    const path = "/users";

    beforeAll(async () => {
        const modRef = await generateTestModule();
        app = modRef.createNestApplication();
        await app.init();

        //Creating and getting user token
        await request(app.getHttpServer()).post("/auth/signup").send(user);
        userToken = await request(app.getHttpServer())
            .post("/auth/login")
            .send(user)
            .then((response) => response.body.token);

        //creating and getting admin token
        await modRef.get(UserService).create({
            email: admin.email,
            hash: await bcrypt.hash(admin.password!, 10),
            roles: [Role.Admin],
        });
        adminToken = await request(app.getHttpServer())
            .post("/auth/login")
            .send(admin)
            .then((response) => response.body.token);
    });

    describe("/users (GET)", () => {
        it("Should return 200 with a list of users", async () => {
            await request(app.getHttpServer())
                .get(path)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.message).toBe(
                        "Retrieved all users successfully",
                    );
                    expect(response.body.users.length).toBe(2);
                });
        });

        it("Should optionally accept 'limit' and 'offset' as query parameters", async () => {
            await request(app.getHttpServer())
                .get(path.concat("?limit=1&offset=0"))
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200)
                .then((response) => {
                    expect(response.body.message).toBe(
                        "Retrieved all users successfully",
                    );
                    expect(response.body.users.length).toBe(1);
                });
        });

        describe("/users/:id", () => {
            it("Should return 200 with the specified user", async () => {
                await request(app.getHttpServer())
                    .get(path.concat("/1"))
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Retrieved specified user successfully",
                        );
                        expect(response.body.user).toBeDefined();
                    });
            });

            it("Should return 404 when the user does not exist", async () => {
                await request(app.getHttpServer())
                    .get(path.concat("/99999"))
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(404)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Specified user does not exist",
                        );
                    });
            });
        });

        describe("/users/by-email/:email", () => {
            it("Should return 200 with the specified user", async () => {
                await request(app.getHttpServer())
                    .get(`/users/by-email/${user.email}`)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Retrieved specified user successfully",
                        );
                        expect(response.body.user).toBeDefined();
                    });
            });

            it("Should return 404 when the user does not exist", async () => {
                await request(app.getHttpServer())
                    .get("/users/by-email/foo@gar.com")
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(404)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Specified user does not exist",
                        );
                    });
            });
        });
    });

    describe("/users (POST)", () => {
        it("Should return 201 when successfull", async () => {
            await request(app.getHttpServer())
                .post(path)
                .send({
                    email: `test-user${Date.now()}@gmail.com`,
                    password: "Strongassoword123!",
                })
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(201)
                .then((response) => {
                    expect(response.body.message).toBe(
                        "User created successfully",
                    );
                });
        });

        it("Should return 409 if the user already exist", async () => {
            await request(app.getHttpServer())
                .post(path)
                .send(user)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(409)
                .then((response) => {
                    expect(response.body.message).toBe(
                        "Email address is already registered",
                    );
                });
        });
    });

    describe("/users (DELETE)", () => {
        describe("/users/:id", () => {
            it("Should return 200 when successfull", async () => {
                await request(app.getHttpServer())
                    .delete(path.concat("/1"))
                    .send(user)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "User deleted successfully",
                        );
                    });
            });

            it("Should return 404 when user does not exist", async () => {
                await request(app.getHttpServer())
                    .delete(path.concat("/9999"))
                    .send(user)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(404)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Requested user does not exist",
                        );
                    });
            });
        });
        describe("/users/by-email/:email", () => {
            it("Should return 404 when user does not exist", async () => {
                await request(app.getHttpServer())
                    .delete(path.concat("/by-email/foo@bar.com"))
                    .send(user)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(404)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Requested user does not exist",
                        );
                    });
            });

            it("Should return 200 when successfull", async () => {
                await request(app.getHttpServer())
                    .delete(path.concat(`/by-email/${admin.email}`))
                    .send(user)
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "User deleted successfully",
                        );
                    });
            });
        });
    });

    describe("/users (PATCH)", () => {
        // Create a persistent user for conflict testing
        let conflictTestUser: any;

        beforeAll(async () => {
            conflictTestUser = generateTestUser(UserFormat.PASSWORD);
            await request(app.getHttpServer())
                .post(path)
                .send(conflictTestUser)
                .set("Authorization", `Bearer ${adminToken}`);
        });

        describe("/users/:id", () => {
            let testUser: any;
            let testUserId: number;

            beforeEach(async () => {
                // Create a fresh test user for each update test
                testUser = generateTestUser(UserFormat.PASSWORD);
                const response = await request(app.getHttpServer())
                    .post(path)
                    .send(testUser)
                    .set("Authorization", `Bearer ${adminToken}`);

                // Get the created user's ID
                const getUserResponse = await request(app.getHttpServer())
                    .get(`/users/by-email/${testUser.email}`)
                    .set("Authorization", `Bearer ${adminToken}`);

                testUserId = getUserResponse.body.user.id;
            });

            it("Should return 200 when updating email successfully", async () => {
                const newEmail = `updated-${Date.now()}@example.com`;

                await request(app.getHttpServer())
                    .patch(path.concat(`/${testUserId}`))
                    .send({ email: newEmail })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "User updated successfully",
                        );
                        expect(response.body.user.email).toBe(newEmail);
                        expect(response.body.user.hash).toBeUndefined();
                    });
            });

            it("Should return 200 when updating password successfully", async () => {
                await request(app.getHttpServer())
                    .patch(path.concat(`/${testUserId}`))
                    .send({ password: "NewPassword123!" })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "User updated successfully",
                        );
                        expect(response.body.user).toBeDefined();
                        expect(response.body.user.hash).toBeUndefined();
                    });
            });

            it("Should return 200 when updating both email and password", async () => {
                const newEmail = `updated-both-${Date.now()}@example.com`;

                await request(app.getHttpServer())
                    .patch(path.concat(`/${testUserId}`))
                    .send({
                        email: newEmail,
                        password: "NewPassword123!",
                    })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "User updated successfully",
                        );
                        expect(response.body.user.email).toBe(newEmail);
                        expect(response.body.user.hash).toBeUndefined();
                    });
            });

            it("Should return 404 when user does not exist", async () => {
                await request(app.getHttpServer())
                    .patch(path.concat("/99999"))
                    .send({ email: "newemail@example.com" })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(404)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Specified user does not exist",
                        );
                    });
            });

            it("Should return 409 when email already exists", async () => {
                await request(app.getHttpServer())
                    .patch(path.concat(`/${testUserId}`))
                    .send({ email: conflictTestUser.email })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(409)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Email address is already registered",
                        );
                    });
            });

            it("Should return 400 when password does not meet requirements", async () => {
                await request(app.getHttpServer())
                    .patch(path.concat(`/${testUserId}`))
                    .send({ password: "weak" })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(400);
            });

            it("Should not update id or roles even if provided", async () => {
                const newEmail = `no-role-change-${Date.now()}@example.com`;

                await request(app.getHttpServer())
                    .patch(path.concat(`/${testUserId}`))
                    .send({
                        email: newEmail,
                        id: 9999,
                        roles: [Role.Admin],
                    })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.user.id).toBe(testUserId);
                        expect(response.body.user.id).not.toBe(9999);
                        expect(response.body.user.roles).not.toContain(
                            Role.Admin,
                        );
                    });
            });
        });

        describe("/users/by-email/:email", () => {
            let testUser: any;

            beforeEach(async () => {
                // Create a fresh test user for each update test
                testUser = generateTestUser(UserFormat.PASSWORD);
                await request(app.getHttpServer())
                    .post(path)
                    .send(testUser)
                    .set("Authorization", `Bearer ${adminToken}`);
            });

            it("Should return 200 when updating email successfully", async () => {
                const newEmail = `updated-by-email-${Date.now()}@example.com`;

                await request(app.getHttpServer())
                    .patch(path.concat(`/by-email/${testUser.email}`))
                    .send({ email: newEmail })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "User updated successfully",
                        );
                        expect(response.body.user.email).toBe(newEmail);
                        expect(response.body.user.hash).toBeUndefined();
                    });
            });

            it("Should return 200 when updating password successfully", async () => {
                await request(app.getHttpServer())
                    .patch(path.concat(`/by-email/${testUser.email}`))
                    .send({ password: "NewPassword123!" })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "User updated successfully",
                        );
                        expect(response.body.user).toBeDefined();
                        expect(response.body.user.hash).toBeUndefined();
                    });
            });

            it("Should return 404 when user does not exist", async () => {
                await request(app.getHttpServer())
                    .patch(path.concat("/by-email/nonexistent@example.com"))
                    .send({ email: "newemail@example.com" })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(404)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Specified user does not exist",
                        );
                    });
            });

            it("Should return 409 when email already exists", async () => {
                await request(app.getHttpServer())
                    .patch(path.concat(`/by-email/${testUser.email}`))
                    .send({ email: conflictTestUser.email })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(409)
                    .then((response) => {
                        expect(response.body.message).toBe(
                            "Email address is already registered",
                        );
                    });
            });

            it("Should not update id or roles even if provided", async () => {
                const newEmail = `no-role-change-email-${Date.now()}@example.com`;

                await request(app.getHttpServer())
                    .patch(path.concat(`/by-email/${testUser.email}`))
                    .send({
                        email: newEmail,
                        id: 9999,
                        roles: [Role.Admin],
                    })
                    .set("Authorization", `Bearer ${adminToken}`)
                    .expect(200)
                    .then((response) => {
                        expect(response.body.user.id).not.toBe(9999);
                        expect(response.body.user.roles).not.toContain(
                            Role.Admin,
                        );
                    });
            });
        });
    });
});

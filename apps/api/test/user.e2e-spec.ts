import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { UserService } from "../src/user/user.service";
import { Role } from "../src/role/role.enum";
import bcrypt from "bcryptjs";
import { generateTestModule, generateTestUser } from "../src/utils/test.util";

describe("UserController (e2e)", () => {
    let app: INestApplication<App>;
    const user = generateTestUser();
    const admin = generateTestUser();
    let userToken: string;
    let adminToken: string;
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
            hash: await bcrypt.hash(admin.password, 10),
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
                    .get(path.concat(`/by-email/${user.email}`))
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
                    .get(path.concat("/by-email/foo@bar.com"))
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
});

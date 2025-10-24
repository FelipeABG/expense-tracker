import { Controller } from "@nestjs/common";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { contract } from "contract";
import { UserService } from "./user.service";
import bcrypt from "bcryptjs";
import { User } from "./user.entity";
import { Roles } from "../role/role.decorator";
import { Role } from "../role/role.enum";

@Controller()
@Roles(Role.Admin)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @TsRestHandler(contract.User)
    async handler() {
        return tsRestHandler(contract.User, {
            create: async ({ body }) => {
                const hash = await bcrypt.hash(body.password, 10);
                await this.userService.create({
                    email: body.email,
                    hash,
                });

                return {
                    status: 201,
                    body: { message: "User created successfully" },
                };
            },

            getAll: async ({ query }) => {
                const limit = query?.limit ?? 100;
                const offset = query?.offset ?? 0;

                const users: User[] = await this.userService.findAll(
                    limit,
                    offset,
                );

                return {
                    status: 200,
                    body: {
                        message: "Retrieved all users successfully",
                        users: users,
                    },
                };
            },

            getById: async ({ params }) => {
                const user = await this.userService.findBy({ id: params.id });
                return {
                    status: 200,
                    body: {
                        message: "Retrieved specified user successfully",
                        user,
                    },
                };
            },

            getByEmail: async ({ params }) => {
                const user = await this.userService.findBy({
                    email: params.email,
                });
                return {
                    status: 200,
                    body: {
                        message: "Retrieved specified user successfully",
                        user,
                    },
                };
            },

            deleteById: async ({ params }) => {
                await this.userService.delete({ id: params.id });
                return {
                    status: 200,
                    body: { message: "User deleted successfully" },
                };
            },

            deleteByEmail: async ({ params }) => {
                await this.userService.delete({ email: params.email });
                return {
                    status: 200,
                    body: { message: "User deleted successfully" },
                };
            },
        });
    }
}

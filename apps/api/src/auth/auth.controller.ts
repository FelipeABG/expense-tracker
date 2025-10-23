import { Controller } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { Public } from "./auth.decorator";
import { contract } from "contract";

@Controller()
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @TsRestHandler(contract.Authentication)
    async handler() {
        return tsRestHandler(contract.Authentication, {
            signup: async ({ body }) => {
                await this.authService.signup(body.email, body.password);

                return {
                    status: 201,
                    body: { message: "User registered successfully" },
                };
            },

            login: async ({ body }) => {
                const result = await this.authService.login(
                    body.email,
                    body.password,
                );
                return {
                    status: 200,
                    body: result,
                };
            },
        });
    }
}

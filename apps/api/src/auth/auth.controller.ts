import {
    ConflictException,
    Controller,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { tsRestHandler, TsRestHandler } from "@ts-rest/nest";
import { Public } from "./auth.decorator";
import { contract, INTERNAL_SERVER_ERROR } from "contract";

@Controller()
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @TsRestHandler(contract.Authentication)
    async handler() {
        return tsRestHandler(contract.Authentication, {
            signup: async ({ body }) => {
                try {
                    await this.authService.signup(body.email, body.password);

                    return {
                        status: 201,
                        body: { message: "Registered user successfully" },
                    };
                } catch (err) {
                    if (err instanceof ConflictException) {
                        return {
                            status: 409,
                            body: { message: err.message },
                        };
                    }
                    return INTERNAL_SERVER_ERROR;
                }
            },

            login: async ({ body }) => {
                try {
                    const result = await this.authService.login(
                        body.email,
                        body.password,
                    );
                    return {
                        status: 200,
                        body: result,
                    };
                } catch (err) {
                    if (err instanceof NotFoundException) {
                        return { status: 404, body: { message: err.message } };
                    }
                    if (err instanceof UnauthorizedException) {
                        return { status: 401, body: { message: err.message } };
                    }

                    return INTERNAL_SERVER_ERROR;
                }
            },
        });
    }
}

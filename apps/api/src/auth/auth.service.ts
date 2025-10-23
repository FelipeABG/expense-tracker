import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../user/user.service";
import bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async signup(email: string, password: string) {
        const hash = await bcrypt.hash(password, 10);
        await this.userService.create({ email, hash });
        return { message: "Signed up successfully" };
    }

    async login(email: string, password: string) {
        const user = await this.userService.findBy({ email });

        const match = await bcrypt.compare(password, user.hash);

        if (!match) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload = { sub: user.id, roles: user.roles, email: user.email };
        return {
            message: "Logged in successfully",
            token: await this.jwtService.signAsync(payload),
        };
    }
}

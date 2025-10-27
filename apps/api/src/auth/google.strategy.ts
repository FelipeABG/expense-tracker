import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get("GOOGLE_CLIENT_ID") as string,
            clientSecret: configService.get("GOOGLE_CLIENT_SECRET") as string,
            callbackURL: configService.get("GOOGLE_CALLBACK_URL") as string,
            scope: ["profile", "email"],
        });
    }

    validate(accessToken: string, refreshToken: string, profile: Profile) {
        throw new Error("Method not implemented.");
    }
}

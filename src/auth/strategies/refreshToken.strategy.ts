import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { Injectable } from "@nestjs/common";
import { JWT, SETTINGS_TOKEN } from "../../const/const";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "refresh") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                RefreshTokenStrategy.extractJWT,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: true,
            secretOrKey: SETTINGS_TOKEN.JWT_REFRESH_SECRET,
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: JWT) {
        return { email: payload.email, deviceId: payload.deviceId };
    }

    private static extractJWT(req: Request): string | null {
        if (req.cookies && "refreshToken" in req.cookies) {
            return req.cookies.refreshToken;
        }
        return null;
    }
}

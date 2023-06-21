import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JWT, SETTINGS_TOKEN } from "../../const/const";
import { UsersRepository } from "../../users/users.repository";

@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, "access") {
    constructor(@Inject("userRepository") private readonly userRepository: UsersRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: SETTINGS_TOKEN.JWT_ACCESS_SECRET,
        });
    }

    async validate(payload: JWT) {
        // const user = await this.userRepository.find(payload.id);
        // //console.log("user in strategy", user);
        // if (user.banInfo.isBanned) {
        //     throw new UnauthorizedException();
        // }
        return { userId: payload.id };
    }
}

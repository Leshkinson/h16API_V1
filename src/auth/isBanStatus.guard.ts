import { Observable } from "rxjs";
import { Request } from "express";
import {
    applyDecorators,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { RequestWithUser } from "./interface/auth.interface";

@Injectable()
export class _IsBanStatus implements CanActivate {
    constructor(@Inject("userRepository") private readonly userRepository: UsersRepository) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest() as RequestWithUser;
        const request = req as RequestWithUser;
        const { loginOrEmail } = request.body;
        //console.log("request.user", request);
        //const { email } = request.user;
        if (loginOrEmail) {
            const user = await this.userRepository.findUserByParam(loginOrEmail);
            if (user.banInfo.isBanned) {
                throw new UnauthorizedException();
            }

            return true;
        }
        // if (email) {
        //     const user = await this.userRepository.findUserByParam(email);
        //     if (user.banInfo.isBanned) {
        //         throw new UnauthorizedException();
        //     }
        //
        //     return true;
        // }
    }
}

export function IsBanStatus() {
    return applyDecorators(UseGuards(_IsBanStatus));
}

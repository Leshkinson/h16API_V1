import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    applyDecorators,
    UseGuards,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";

const LOGIN = "admin";
const PASSWORD = "qwerty";
const TRUEPassword = "Basic YWRtaW46cXdlcnR5";

@Injectable()
export class _AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const authorization: string | undefined = request.headers.authorization;
        if (!authorization || authorization !== TRUEPassword) {
            throw new UnauthorizedException();
        }

        const encoded = authorization.substring(6);
        const decoded = Buffer.from(encoded, "base64").toString("ascii");
        const [login, password] = decoded.split(":");
        if (login !== LOGIN || password !== PASSWORD) {
            throw new UnauthorizedException();
        }
        return true;
    }
}

export function AuthGuard() {
    return applyDecorators(UseGuards(_AuthGuard));
}

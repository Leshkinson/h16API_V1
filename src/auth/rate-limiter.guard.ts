import { Observable } from "rxjs";
import { Request } from "express";
import {
    applyDecorators,
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    UseGuards,
} from "@nestjs/common";
import NodeCache from "node-cache";

let count = 1;
const myCache = new NodeCache();

@Injectable()
export class _RateLimiter implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request: Request = context.switchToHttp().getRequest();
        const url = request.url;
        const tracker = request.ip;
        const prefixAgent = request.headers["user-agent"] ? request.headers["user-agent"] : "unKnown";
        const generateKey = (url: string, agentContext: string, suffix: string): string => {
            return `${url}-${agentContext}-${suffix}`;
        };
        const key = generateKey(url, prefixAgent, tracker);

        if (myCache.has(`${key}`)) {
            const foo = myCache.get(`${key}`);
            if (Number(foo) > 4) {
                throw new HttpException("TOO_MANY_REQUESTS", HttpStatus.TOO_MANY_REQUESTS);
            }
            count = Number(foo) + 1;
        }
        myCache.set(`${key}`, count, 10);
        count = 1;

        return true;
    }
}

export function RateLimiterGuard() {
    return applyDecorators(UseGuards(_RateLimiter));
}

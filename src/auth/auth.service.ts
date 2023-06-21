import { JwtService } from "@nestjs/jwt";
import { JwtPayload } from "jsonwebtoken";
import { Injectable } from "@nestjs/common";
import { JWT, SETTINGS_TOKEN } from "../const/const";
import { SessionsService } from "../sessions/sessions.service";

@Injectable()
export class AuthService {
    private readonly optionsAccess: string;
    private readonly secretAccess: string;
    private readonly optionsRefresh: string;
    private readonly secretRefresh: string;
    constructor(private readonly jwtService: JwtService, private readonly sessionsService: SessionsService) {
        this.optionsAccess = SETTINGS_TOKEN.TOKEN_ACCESS_LIVE_TIME;
        this.secretAccess = SETTINGS_TOKEN.JWT_ACCESS_SECRET;
        this.optionsRefresh = SETTINGS_TOKEN.TOKEN_REFRESH_LIVE_TIME;
        this.secretRefresh = SETTINGS_TOKEN.JWT_REFRESH_SECRET;
    }

    public async getTokens(
        //todo here shit type
        payload: ({ id: any; email?: undefined; deviceId?: undefined } | { id: any; email: any; deviceId: any })[],
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload[0], { secret: this.secretAccess, expiresIn: this.optionsAccess }),
            this.jwtService.signAsync(payload[1], { secret: this.secretRefresh, expiresIn: this.optionsRefresh }),
        ]);

        return { accessToken, refreshToken };
    }

    public getPayloadByAccessToken(token: string): string | JwtPayload | JWT | boolean {
        const { exp } = this.jwtService.decode(token) as JwtPayload;
        if (!exp) return false;
        if (Date.now() >= exp * 1000) {
            return false;
        }
        return this.jwtService.verify(token, { secret: this.secretAccess });
    }

    public getPayloadByRefreshToken(token: string): string | JwtPayload | JWT | boolean {
        const { exp } = this.jwtService.decode(token) as JwtPayload;
        if (!exp) return false;
        if (Date.now() >= exp * 1000) {
            return false;
        }
        return this.jwtService.verify(token, { secret: SETTINGS_TOKEN.JWT_REFRESH_SECRET });
    }

    public async checkTokenByBlackList(token: string): Promise<boolean> {
        const { deviceId, lastActiveDate } = this.jwtService.decode(token) as JwtPayload;
        const session = await this.sessionsService.findSession(deviceId);
        return lastActiveDate === session?.lastActiveDate;
    }

    public async getPayloadFromToken(refreshToken: string): Promise<JWT> {
        if (!refreshToken) throw new Error();
        const isBlockedToken = await this.checkTokenByBlackList(refreshToken);
        if (!isBlockedToken) throw new Error();
        const payload = (await this.getPayloadByRefreshToken(refreshToken)) as JWT;
        if (!payload) throw new Error();

        return payload;
    }
}

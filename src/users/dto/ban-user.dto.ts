import { IBanUser } from "../interface/user.interface";
import { IsBoolean, IsNotEmpty, IsString, MinLength } from "class-validator";

export class BanUserDto implements IBanUser {
    @IsBoolean()
    @IsNotEmpty()
    readonly isBanned: boolean;

    @MinLength(20)
    @IsString()
    @IsNotEmpty()
    readonly banReason: string;
}

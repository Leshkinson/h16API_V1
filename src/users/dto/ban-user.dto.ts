import { IBanUser } from "../interface/user.interface";
import { IsBoolean, IsNotEmpty, IsString, MinLength } from "class-validator";
import { IBlogBanned } from "../../blogs/interface/blog.interface";

export class BanUserDto implements IBanUser {
    @IsBoolean()
    @IsNotEmpty()
    readonly isBanned: boolean;

    @MinLength(20)
    @IsString()
    @IsNotEmpty()
    readonly banReason: string;
}

export class BanUserDtoForBlog implements IBlogBanned {
    @IsBoolean()
    @IsNotEmpty()
    isBanned: boolean;

    @MinLength(20)
    @IsString()
    @IsNotEmpty()
    banReason: string;

    @IsString()
    @IsNotEmpty()
    blogId: string;
}

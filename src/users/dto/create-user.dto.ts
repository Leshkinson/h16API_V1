import { ICreateUserDto } from "../interface/user.interface";
import { IsExistByParam } from "../../pipes/validation.pipes";
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto implements ICreateUserDto {
    @IsExistByParam({ message: "Login is exist. (This login already exists enter another login)" })
    @Matches(/^[a-zA-Z0-9_-]*$/)
    @MinLength(3)
    @MaxLength(10)
    @IsString()
    @IsNotEmpty()
    readonly login: string;

    @MinLength(6)
    @MaxLength(20)
    readonly password: string;

    @IsExistByParam({ message: "Email is exist. (This email already exists enter another email)" })
    @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    @MaxLength(100)
    @IsString()
    @IsNotEmpty()
    readonly email: string;
}

import { ICreatePostDto, ICreatePostDtoWithoutIdAndName } from "../interface/post.interface";
import { IsNotEmpty, IsString, MaxLength, Validate } from "class-validator";
import { IsBlogIdCheck, TrimStringValidator } from "../../pipes/validation.pipes";

export class UpdatePostDto implements ICreatePostDto {
    @MaxLength(30)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly title: string;

    @MaxLength(100)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly shortDescription: string;

    @MaxLength(1000)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly content: string;

    @IsBlogIdCheck({ message: "BlogId has incorrect value. (BlogId not found)" })
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly blogId: string;
}

export class UpdatePostDtoByQuery implements ICreatePostDtoWithoutIdAndName {
    @MaxLength(30)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly title: string;

    @MaxLength(100)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly shortDescription: string;

    @MaxLength(1000)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly content: string;
}

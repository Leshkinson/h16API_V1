import { ICreateBlogDto } from "../interface/blog.interface";
import { TrimStringValidator } from "../../pipes/validation.pipes";
import { IsNotEmpty, IsString, Matches, MaxLength, Validate } from "class-validator";

export class UpdateBlogDto implements ICreateBlogDto {
    @MaxLength(15)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly name: string;

    @MaxLength(500)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly description: string;

    @Matches(/^(https?:\/\/)?([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?$/)
    @MaxLength(100)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly websiteUrl: string;
}

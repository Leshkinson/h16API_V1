import { IsNotEmpty, IsString, MaxLength, Validate } from "class-validator";
import { ICreatePostDtoWithoutIdAndName } from "../interface/post.interface";
import { IsBlogIdCheck, TrimStringValidator } from "../../pipes/validation.pipes";

export class CreatePostDtoWithoutIdAndName implements ICreatePostDtoWithoutIdAndName {
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
    constructor(title, shortDescription, content) {
        this.title = title;
        this.shortDescription = shortDescription;
        this.content = content;
    }
}

export class CreatePostDto extends CreatePostDtoWithoutIdAndName {
    @IsBlogIdCheck({ message: "BlogId has incorrect value. (BlogId not found)" })
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly blogId: string;
    constructor(title, shortDescription, content, blogId) {
        super(title, shortDescription, content);
        this.blogId = blogId;
    }
}

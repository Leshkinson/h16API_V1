import { IContent } from "../interface/comment.interface";
import { IsNotEmpty, IsString, MaxLength, MinLength, Validate } from "class-validator";
import { TrimStringValidator } from "../../pipes/validation.pipes";

export class CreateCommentDto implements IContent {
    @MinLength(20)
    @MaxLength(300)
    @IsString()
    @IsNotEmpty()
    @Validate(TrimStringValidator)
    readonly content: string;
}

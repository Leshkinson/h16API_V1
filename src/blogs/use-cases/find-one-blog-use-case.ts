import { RefType } from "mongoose";
import { Inject } from "@nestjs/common";
import { BlogModel } from "../schema/blog.schema";
import { IBlog } from "../interface/blog.interface";
import { BlogsRepository } from "../blogs.repository";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

export class FindOneBlogCommand {
    constructor(public readonly message: RefType | string) {}
}

@CommandHandler(FindOneBlogCommand)
export class FindOneBlogHandler implements ICommandHandler<FindOneBlogCommand> {
    constructor(@Inject("blogRepository") private readonly blogRepository: BlogsRepository) {
        this.blogRepository = new BlogsRepository(BlogModel);
    }

    public async execute(command: FindOneBlogCommand): Promise<IBlog | undefined> {
        console.log("FindOneBlogCommand");
        const blog = await this.blogRepository.find(command.message);
        if (!blog) throw new Error();

        return blog;
    }
}

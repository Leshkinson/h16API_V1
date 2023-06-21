import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { BlogsService } from "./blogs.service";
import { blogsProviders } from "./blogs.providers";
import { AuthService } from "../auth/auth.service";
import { BlogsController } from "./blogs.controller";
import { BlogsRepository } from "./blogs.repository";
import { postsProviders } from "../posts/posts.providers";
import { usersProviders } from "../users/users.providers";
import { PostsRepository } from "../posts/posts.repository";
import { UsersRepository } from "../users/users.repository";
import { DatabaseModule } from "../database/database.module";
import { SessionsService } from "../sessions/sessions.service";
import { sessionsProviders } from "../sessions/sessions.providers";
import { QueryService } from "../sup-services/query/query.service";
import { commentsProviders } from "../comments/comments.providers";
import { CommentsRepository } from "../comments/comments.repository";
import { SessionsRepository } from "../sessions/sessions.repository";
import { likesProviders } from "../sup-services/query/like.providers";
import { LikesRepository } from "../sup-services/query/like.repository";
import { BloggerBlogsController } from "./blogger_api/blogger_blogs.controller";
import { PublicBlogsController } from "./public_api/public_blogs.controller";
import { SABlogsController } from "./super_admin_api/sa_blogs.controller";
import { BanListRepository } from "../sup-services/query/ban-list.repository";
import { banListProviders } from "../sup-services/query/ban-list.providers";
//import { FindOneBlogUseCase } from "./use-cases/find-one-blog-use-case";
import { CommandBus, CqrsModule, QueryBus } from "@nestjs/cqrs";
import { FindOneBlogHandler } from "./use-cases/find-one-blog-use-case";

//const useCases = [FindOneBlogUseCase];

@Module({
    imports: [DatabaseModule, CqrsModule],
    controllers: [BloggerBlogsController, PublicBlogsController, SABlogsController],
    providers: [
        BlogsService,
        QueryService,
        AuthService,
        JwtService,
        SessionsService,
        {
            provide: "blogRepository",
            useValue: BlogsRepository,
        },
        {
            provide: "postRepository",
            useValue: PostsRepository,
        },
        {
            provide: "likeRepository",
            useValue: LikesRepository,
        },
        {
            provide: "userRepository",
            useValue: UsersRepository,
        },
        {
            provide: "commentRepository",
            useValue: CommentsRepository,
        },
        {
            provide: "sessionRepository",
            useValue: SessionsRepository,
        },
        {
            provide: "banListRepository",
            useValue: BanListRepository,
        },
        ...banListProviders,
        ...blogsProviders,
        ...likesProviders,
        ...postsProviders,
        ...usersProviders,
        ...commentsProviders,
        ...sessionsProviders,
        FindOneBlogHandler,
        //...useCases,
    ],
    exports: [BlogsService],
})
export class BlogsModule {}

import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { UsersModule } from "./users/users.module";
import { BlogsModule } from "./blogs/blogs.module";
import { PostsModule } from "./posts/posts.module";
import { BlogsRepository } from "./blogs/blogs.repository";
import { PostsRepository } from "./posts/posts.repository";
import { UsersRepository } from "./users/users.repository";
import { DatabaseModule } from "./database/database.module";
import { CommentsModule } from "./comments/comments.module";
import { SessionsModule } from "./sessions/sessions.module";
import { QueryService } from "./sup-services/query/query.service";
import { CommentsRepository } from "./comments/comments.repository";
import { LikesRepository } from "./sup-services/query/like.repository";
import { BanListRepository } from "./sup-services/query/ban-list.repository";
import {BanListForBlogRepository} from "./sup-services/query/ban-list-for-blog.repository";

@Module({
    imports: [BlogsModule, PostsModule, DatabaseModule, CommentsModule, SessionsModule, AuthModule, UsersModule],
    controllers: [AppController],
    providers: [
        QueryService,
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
            provide: "banListRepository",
            useValue: BanListRepository,
        },
        {
            provide: "banListForBlogRepository",
            useValue: BanListForBlogRepository
        },
    ],
})
export class AppModule {}

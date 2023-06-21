import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PostsService } from "./posts.service";
import { AuthService } from "../auth/auth.service";
import { postsProviders } from "./posts.providers";
import { PostsController } from "./posts.controller";
import { PostsRepository } from "./posts.repository";
import { UsersService } from "../users/users.service";
import { blogsProviders } from "../blogs/blogs.providers";
import { usersProviders } from "../users/users.providers";
import { UsersRepository } from "../users/users.repository";
import { BlogsRepository } from "../blogs/blogs.repository";
import { DatabaseModule } from "../database/database.module";
import { SessionsService } from "../sessions/sessions.service";
import { sessionsProviders } from "../sessions/sessions.providers";
import { QueryService } from "../sup-services/query/query.service";
import { commentsProviders } from "../comments/comments.providers";
import { CommentsRepository } from "../comments/comments.repository";
import { SessionsRepository } from "../sessions/sessions.repository";
import { likesProviders } from "../sup-services/query/like.providers";
import { LikesRepository } from "../sup-services/query/like.repository";
import { MailModule } from "../sup-services/application/mailer/mail.module";
import { MailService } from "../sup-services/application/mailer/mail.service";
import { BanListRepository } from "../sup-services/query/ban-list.repository";
import { banListProviders } from "../sup-services/query/ban-list.providers";

@Module({
    imports: [DatabaseModule, MailModule],
    controllers: [PostsController],
    providers: [
        PostsService,
        QueryService,
        AuthService,
        UsersService,
        JwtService,
        SessionsService,
        MailService,
        {
            provide: "postRepository",
            useValue: PostsRepository,
        },
        {
            provide: "blogRepository",
            useValue: BlogsRepository,
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
        ...postsProviders,
        ...likesProviders,
        ...usersProviders,
        ...commentsProviders,
        ...sessionsProviders,
    ],
    exports: [PostsService],
})
export class PostsModule {}

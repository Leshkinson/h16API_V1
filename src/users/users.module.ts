import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "./users.service";
import { usersProviders } from "./users.providers";
import { AuthService } from "../auth/auth.service";
import { UsersRepository } from "./users.repository";
import { postsProviders } from "../posts/posts.providers";
import { blogsProviders } from "../blogs/blogs.providers";
import { BlogsRepository } from "../blogs/blogs.repository";
import { PostsRepository } from "../posts/posts.repository";
import { DatabaseModule } from "../database/database.module";
import { SessionsService } from "../sessions/sessions.service";
import { QueryService } from "../sup-services/query/query.service";
import { commentsProviders } from "../comments/comments.providers";
import { sessionsProviders } from "../sessions/sessions.providers";
import { CommentsRepository } from "../comments/comments.repository";
import { SessionsRepository } from "../sessions/sessions.repository";
import { likesProviders } from "../sup-services/query/like.providers";
import { MAILER_OPTIONS, MailerService } from "@nestjs-modules/mailer";
import { LikesRepository } from "../sup-services/query/like.repository";
import { Sa_usersController } from "./super_admin_api/sa_users.controller";
import { MailModule } from "../sup-services/application/mailer/mail.module";
import { banListProviders } from "../sup-services/query/ban-list.providers";
import { MailService } from "../sup-services/application/mailer/mail.service";
import { BanListRepository } from "../sup-services/query/ban-list.repository";
import { banListForBlogProviders } from "../sup-services/query/ban-list-for-blog.providers";
import { BanListForBlogRepository } from "../sup-services/query/ban-list-for-blog.repository";

@Module({
    imports: [DatabaseModule, MailModule],
    controllers: [Sa_usersController],
    providers: [
        UsersService,
        QueryService,
        AuthService,
        JwtService,
        SessionsService,
        MailService,
        {
            provide: "blogRepository",
            useValue: BlogsRepository,
        },
        {
            provide: "userRepository",
            useValue: UsersRepository,
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
            provide: "commentRepository",
            useValue: CommentsRepository,
        },
        {
            provide: "sessionRepository",
            useValue: SessionsRepository,
        },
        {
            provide: `${MAILER_OPTIONS}`,
            useExisting: MailerService,
        },
        {
            provide: "banListRepository",
            useValue: BanListRepository,
        },
        {
            provide: "banListForBlogRepository",
            useValue: BanListForBlogRepository,
        },
        ...banListForBlogProviders,
        ...banListProviders,
        ...blogsProviders,
        ...usersProviders,
        ...postsProviders,
        ...likesProviders,
        ...commentsProviders,
        ...sessionsProviders,
    ],
    exports: [UsersService],
})
export class UsersModule {}

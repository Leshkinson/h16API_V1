import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth/auth.service";
import { SessionsService } from "./sessions.service";
import { UsersService } from "../users/users.service";
import { sessionsProviders } from "./sessions.providers";
import { usersProviders } from "../users/users.providers";
import { SessionsRepository } from "./sessions.repository";
import { SessionsController } from "./sessions.controller";
import { UsersRepository } from "../users/users.repository";
import { DatabaseModule } from "../database/database.module";
import { MAILER_OPTIONS, MailerService } from "@nestjs-modules/mailer";
import { MailModule } from "../sup-services/application/mailer/mail.module";
import { MailService } from "../sup-services/application/mailer/mail.service";
import { BanListRepository } from "../sup-services/query/ban-list.repository";
import { banListProviders } from "../sup-services/query/ban-list.providers";

@Module({
    imports: [DatabaseModule, MailModule],
    controllers: [SessionsController],
    providers: [
        SessionsService,
        UsersService,
        AuthService,
        JwtService,
        MailService,
        {
            provide: "sessionRepository",
            useClass: SessionsRepository,
        },
        {
            provide: "userRepository",
            useClass: UsersRepository,
        },
        {
            provide: `${MAILER_OPTIONS}`,
            useExisting: MailerService,
        },
        {
            provide: "banListRepository",
            useValue: BanListRepository,
        },
        ...banListProviders,
        ...sessionsProviders,
        ...usersProviders,
    ],
})
export class SessionsModule {}

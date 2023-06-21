import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { ConfigModule, ConfigService } from "@nestjs/config";
// import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
// import { join } from "path";

const EMAIL_HOST = "smtp.yandex.ru";
const EMAIL_ADDRESS = "lopatkool93oleg@yandex.ru";
const EMAIL_PASSWORD = "o1l9E9g3";

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => ({
                transport: {
                    //host: config.get("EMAIL_HOST"),
                    host: `${EMAIL_HOST}`,
                    secure: false,
                    auth: {
                        //user: config.get("EMAIL_USER"),
                        user: `${EMAIL_ADDRESS}`,
                        //pass: config.get("EMAIL_PASSWORD"),
                        pass: `${EMAIL_PASSWORD}`,
                    },
                },
                defaults: {
                    from: `Mailer Test <${EMAIL_ADDRESS}>`,
                },
                // template: {
                //     dir: join(__dirname, "./templates"),
                //     adapter: new HandlebarsAdapter(),
                //     options: {
                //         strict: true,
                //     },
                // },
            }),
            inject: [ConfigService],
        }),
        ConfigModule.forRoot(),
    ],
    providers: [MailService],
})
export class MailModule {}

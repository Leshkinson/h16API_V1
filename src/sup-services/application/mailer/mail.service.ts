import { Injectable } from "@nestjs/common";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
//import { Options } from "nodemailer/lib/mailer";

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    public async send(message: ISendMailOptions) {
        await this.mailerService.sendMail(message);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public async sendConfirmMessage(to: string, code: string, sendMessage: Function): Promise<void> {
        await this.send(sendMessage(to, code));
    }
}

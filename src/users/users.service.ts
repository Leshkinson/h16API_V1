import { uuid } from "uuidv4";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "jsonwebtoken";
import mongoose, { RefType, SortOrder } from "mongoose";
import { BanStatus } from "./types/user.type";
import { BanUserDto } from "./dto/ban-user.dto";
import { UserModel } from "./schema/user.schema";
import { IUser } from "./interface/user.interface";
import { Inject, Injectable } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { IAuth } from "../auth/interface/auth.interface";
import { MailService } from "../sup-services/application/mailer/mail.service";
import { EmailDto, NewPasswordDto, RegistrationDto } from "../auth/dto/auth.dto";
import {
    passwordConfirmedTemplate,
    userInvitationTemplate,
} from "../sup-services/application/mailer/templates/templates";
import { BanListRepository } from "../sup-services/query/ban-list.repository";
import { SessionsService } from "../sessions/sessions.service";
import { BanListModel } from "../sup-services/query/schema/ban-list.schema";

@Injectable()
export class UsersService {
    constructor(
        private readonly sessionsService: SessionsService,
        private readonly mailService: MailService,
        @Inject("userRepository") private readonly userRepository: UsersRepository,
        @Inject("banListRepository") private readonly banListRepository: BanListRepository,
    ) {
        this.userRepository = new UsersRepository(UserModel);
        this.banListRepository = new BanListRepository(BanListModel);
    }

    public async create(createUserDto: CreateUserDto) {
        const hashPassword = await bcrypt.hash(createUserDto.password, 5);
        return this.userRepository.create({ ...createUserDto, password: hashPassword });
    }

    public async findAllUsers(
        sortBy = "createdAt",
        sortDirection: SortOrder | undefined = "desc",
        pageNumber = 1,
        pageSize = 10,
        searchLoginTerm: { login: { $regex: RegExp } } | NonNullable<unknown> = {},
        searchEmailTerm: { email: { $regex: RegExp } } | NonNullable<unknown> = {},
        banStatus: BanStatus = "all",
    ): Promise<IUser[]> {
        const banStatusCFG = {
            all: {},
            banned: { "banInfo.isBanned": true },
            notBanned: { "banInfo.isBanned": false },
        };
        if (searchLoginTerm) searchLoginTerm = { login: { $regex: new RegExp(`.*${searchLoginTerm}.*`, "i") } };
        if (searchEmailTerm) searchEmailTerm = { email: { $regex: new RegExp(`.*${searchEmailTerm}.*`, "i") } };

        const skip = Number((pageNumber - 1) * pageSize);
        console.log("banStatusCFG[banStatus]", banStatusCFG[banStatus]);

        return await this.userRepository.findAll(
            sortBy,
            sortDirection,
            skip,
            pageSize,
            searchLoginTerm,
            searchEmailTerm,
            banStatusCFG[banStatus],
        );
    }

    public async getUserByParam(param: string): Promise<IUser | null> {
        return await this.userRepository.findUserByParam(param);
    }

    public async getUserById(id: string | JwtPayload): Promise<IUser | null> {
        return await this.userRepository.find(id);
    }

    public async createByRegistration(registrationDto: RegistrationDto): Promise<IUser | null> {
        const hashPassword = await bcrypt.hash(registrationDto.password, 5);
        const code = uuid();
        const user = await this.userRepository.createUserByRegistration(
            registrationDto.login,
            hashPassword,
            registrationDto.email,
            code,
        );
        try {
            await this.mailService.sendConfirmMessage(registrationDto.email, code, userInvitationTemplate);
        } catch (error) {
            if (error instanceof Error) {
                await this.userRepository.delete(user._id.toString());
                console.log(error.message);
                return null;
            }
        }

        return user;
    }

    public async confirmUser(code: string): Promise<boolean | null | IUser> {
        const user = await this.getUserByParam(code);
        if (!user) return false;
        if (new Date(user.expirationDate).getTime() > new Date().getTime()) {
            return await this.userRepository.updateUserByConfirmed(user._id.toString());
        }
        await this.userRepository.delete(user._id.toString());

        return false;
    }

    public async confirmNewPassword(newPasswordDto: NewPasswordDto): Promise<boolean | null | IUser> {
        const hashNewPassword = await bcrypt.hash(newPasswordDto.newPassword, 5);
        const user = await this.getUserByParam(newPasswordDto.recoveryCode);
        if (!user) return false;
        return await this.userRepository.updateUserByNewPassword(user._id.toString(), hashNewPassword);
    }

    public async resendConfirmByUser(emailDto: EmailDto): Promise<void> {
        const user = await this.getUserByParam(emailDto.email);
        if (user) {
            const code = uuid();
            await this.userRepository.updateUserByCode(user._id.toString(), code);
            await this.mailService.sendConfirmMessage(emailDto.email, code, userInvitationTemplate);
        }
    }

    public async requestByRecovery(email: string) {
        const user = await this.getUserByParam(email);
        if (user && user.isConfirmed) {
            const recoveryCode = uuid();
            await this.userRepository.updateUserByCode(user._id.toString(), recoveryCode);
            await this.mailService.sendConfirmMessage(email, recoveryCode, passwordConfirmedTemplate);
        }
    }

    public async verifyUser(authDto: IAuth): Promise<IUser> {
        const consideredUser = await this.getUserByParam(authDto.loginOrEmail);
        if (!consideredUser) {
            throw new Error();
        }
        if (await bcrypt.compare(authDto.password, consideredUser.password)) {
            return consideredUser;
        }
        throw new Error();
    }

    public async delete(id: RefType): Promise<IUser> {
        const deleteUser = await this.userRepository.delete(id);
        if (deleteUser) return deleteUser;
        throw new Error();
    }

    public async assigningBanToUser(id: RefType, banUserDto: BanUserDto) {
        const candidateForBan = await this.userRepository.find(id);
        if (!candidateForBan) {
            throw new Error();
        }
        console.log("candidateForBan", candidateForBan);

        const banCondition = !candidateForBan.banInfo.isBanned && banUserDto.isBanned;
        const unBanCondition = candidateForBan.banInfo.isBanned && !banUserDto.isBanned;
        if (!banCondition && !unBanCondition) {
            return false;
        }

        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            if (banCondition) {
                console.log("here1");
                const banDate = new Date().toISOString();
                candidateForBan.banInfo.isBanned = banUserDto.isBanned;
                candidateForBan.banInfo.banDate = banDate;
                candidateForBan.banInfo.banReason = banUserDto.banReason;
                await candidateForBan.save();
                await this.banListRepository.addUserInBanList(id);
                console.log("candidateForBan in transaction", candidateForBan);
            } else {
                console.log("here2");
                candidateForBan.banInfo.isBanned = banUserDto.isBanned;
                candidateForBan.banInfo.banDate = null;
                candidateForBan.banInfo.banReason = null;
                await candidateForBan.save();
                await this.banListRepository.deleteUserFromBanList(id);
            }
            await this.sessionsService.deleteSessionByBanUser(id);
            await session.commitTransaction();
            console.log("success");

            return true;
        } catch (error) {
            console.log("error");
            await session.abortTransaction();

            return false;
        } finally {
            session.endSession().then(() => console.log("Transaction ended"));
        }
    }

    public async testingDelete(): Promise<void> {
        await this.userRepository.deleteAll();
    }
}

import { JwtPayload } from "jsonwebtoken";
import { BanUserDto } from "./dto/ban-user.dto";
import { IUser } from "./interface/user.interface";
import { Inject, Injectable } from "@nestjs/common";
import { Model, RefType, SortOrder } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersRepository {
    constructor(@Inject("USER_MODEL") private readonly userModel: Model<IUser>) {}

    public async create(createUserDto: CreateUserDto): Promise<IUser> {
        return await this.userModel.create({
            ...createUserDto,
            isConfirmed: true,
            // banInfo: {
            //     isBanned: false,
            //     banReason: "nothing nothing nothing nothing",
            //     banDate: null,
            // },
        });
    }

    public async findAll(
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
        skip = 0,
        limit = 10,
        searchLoginTerm: { login: { $regex: RegExp } } | NonNullable<unknown> = {},
        searchEmailTerm: { email: { $regex: RegExp } } | NonNullable<unknown> = {},
        banStatus: any,
    ): Promise<IUser[]> {
        return this.userModel
            .find({ $and: [{ $or: [searchLoginTerm, searchEmailTerm] }, banStatus] })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit);
    }

    public async findAllBanned(
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
        skip = 0,
        limit = 10,
        searchLoginTerm: { login: { $regex: RegExp } } | NonNullable<unknown> = {},
        blogId: string,
    ) {
        return this.userModel
            .find({ $and: [searchLoginTerm, { "banInfo.isBanned": true }, { "banInfo.blogId": blogId }] })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit);
    }

    public async find(id: string | JwtPayload | RefType): Promise<IUser | null> {
        return this.userModel.findById({ _id: id });
    }

    public async findUserByParam(param: string): Promise<IUser | null> {
        return this.userModel.findOne({ $or: [{ login: param }, { email: param }, { code: param }] });
    }

    public async updateUserByConfirmed(id: string): Promise<IUser | null> {
        return this.userModel.findOneAndUpdate(
            { _id: id },
            {
                isConfirmed: true,
            },
        );
    }

    public async updateUserByNewPassword(id: string, newHashPassword: string): Promise<IUser | null> {
        return this.userModel.findOneAndUpdate(
            { _id: id },
            {
                password: newHashPassword,
            },
        );
    }

    public async updateUserByCode(id: string, code: string): Promise<IUser | null> {
        return this.userModel.findOneAndUpdate(
            { _id: id },
            {
                code: code,
            },
        );
    }

    public async updateUserByBan(id: string | RefType, banUserDto: BanUserDto) {
        const banDate = new Date().toISOString();
        return this.userModel.findOneAndUpdate(
            { _id: id },
            {
                isBanned: banUserDto.isBanned,
                banDate: banDate,
                banReason: banUserDto.banReason,
            },
        );
    }

    public async getUsersCount(
        searchLoginTerm: { login: { $regex: RegExp } } | NonNullable<unknown> = {},
        searchEmailTerm: { email: { $regex: RegExp } } | NonNullable<unknown> = {},
        banStatus: any,
    ): Promise<number> {
        return this.userModel.countDocuments({ $and: [{ $or: [searchLoginTerm, searchEmailTerm] }, banStatus] });
    }

    public async getBannedUsersCount(
        searchLoginTerm: { login: { $regex: RegExp } } | NonNullable<unknown> = {},
        blogId: string,
    ): Promise<number> {
        return this.userModel.countDocuments({
            $and: [searchLoginTerm, { "banInfo.isBanned": true }, { "banInfo.blogId": blogId }],
        });
    }

    public async createUser(login: string, password: string, email: string): Promise<IUser> {
        return await this.userModel.create({ login, password, email, isConfirmed: true });
    }

    public async createUserByRegistration(
        login: string,
        password: string,
        email: string,
        code: string,
    ): Promise<IUser> {
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 5);
        return await this.userModel.create({ login, password, email, code, isConfirmed: false, expirationDate });
    }

    public async delete(id: RefType) {
        return this.userModel.findOneAndDelete({ _id: id });
    }

    public async deleteAll() {
        return this.userModel.deleteMany();
    }
}

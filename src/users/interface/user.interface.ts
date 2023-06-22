import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    _id: mongoose.Schema.Types.ObjectId;
    login: string;
    email: string;
    password: string;
    isConfirmed: boolean;
    code: string;
    expirationDate: Date;
    banInfo: IBanInfo;
}

export interface ICreateUserDto {
    login: string;
    password: string;
    email: string;
}

export interface IBanUser {
    isBanned: boolean;
    banReason: string;
}

export interface IBanInfo extends IBanUser {
    banDate: string;
    blogId: string;
}

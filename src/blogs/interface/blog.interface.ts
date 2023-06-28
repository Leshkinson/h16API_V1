import * as mongoose from "mongoose";
import { RefType } from "mongoose";

export interface ICreateBlogDto {
    readonly name: string;
    readonly description: string;
    readonly websiteUrl: string;
}

export interface IBlog extends mongoose.Document {
    readonly _id: mongoose.Schema.Types.ObjectId;
    readonly name: string;
    readonly description: string;
    readonly websiteUrl: string;
    readonly banInfo: {
        isBanned: boolean;
        banDate: string;
    };
}

export interface IBlogWithUserId extends IBlog {
    readonly userId: string;
}

export interface IBlogWithBlogOwnerInfo extends IBlogWithUserId {
    readonly createdAt: string;
    readonly isMembership: boolean;
    readonly blogOwnerInfo: {
        readonly userId: string;
        readonly userLogin: string;
    };
}

export interface IBlogBanned {
    isBanned: boolean;
    banReason: string;
    blogId: string;
}

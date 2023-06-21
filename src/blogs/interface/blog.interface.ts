import * as mongoose from "mongoose";
import { RefType } from "mongoose";

export interface ICreateBlogDto {
    readonly name: string;
    readonly description: string;
    readonly websiteUrl: string;
}

export interface IBlog extends ICreateBlogDto {
    readonly _id: mongoose.Schema.Types.ObjectId;
}

export interface IBlogWithUserId extends IBlog {
    readonly userId: string;
}

export interface IBlogWithBlogOwnerInfo extends IBlogWithUserId {
    readonly createdAt: string;
    readonly isMembership: boolean;
    blogOwnerInfo: {
        readonly userId: string;
        readonly userLogin: string;
    };
}

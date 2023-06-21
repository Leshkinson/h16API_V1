import mongoose from "mongoose";
import { LikesStatusCfgValues, LikesStatusType } from "../types/like.type";

export interface ILikeStatus {
    _id: mongoose.Schema.Types.ObjectId;
    likeStatus: LikesStatusCfgValues;
    userId: string;
    createdAt: Date;
}

export interface ILikeStatusWithoutId {
    likeStatus: LikesStatusCfgValues;
    userId: string;
    createdAt: Date;
}

export interface LikeInfo {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
}

export interface ExtendedLikesInfo extends LikeInfo {
    newestLikes: (UpgradeLikes | undefined)[];
}

export interface UpgradeLikes {
    addedAt: Date;
    userId: string;
    login: string;
}

export interface UpgradeLikesWithoutLogin {
    addedAt: Date;
    userId: string;
}

export interface ILike {
    likeStatus: LikesStatusType;
}

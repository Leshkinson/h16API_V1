//import { Document } from "mongoose";
import * as mongoose from "mongoose";
import { ExtendedLikesInfo } from "../../sup-services/query/interface/like.interface";

export interface IPost extends mongoose.Document {
    _id: mongoose.Schema.Types.ObjectId;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    extendedLikesInfo: ExtendedLikesInfo;
}

export interface ICreatePostDtoWithoutIdAndName {
    title: string;
    shortDescription: string;
    content: string;
}

export interface ICreatePostDto {
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
}

import mongoose from "mongoose";
import { LikeInfo } from "../../sup-services/query/interface/like.interface";

export interface IContent {
    content: string;
}

export interface IComment extends IContent {
    _id: mongoose.Schema.Types.ObjectId;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    likesInfo: LikeInfo;
}
export interface ICommentFullInformation extends IComment {
    postInfo: {
        id: string;
        title: string;
        blogId: string;
        blogName: string;
    };
}

import mongoose from "mongoose";

export interface IBanListForBlog {
    _id: mongoose.Schema.Types.ObjectId;
    blogId: string;
    //createdAt: Date;
}

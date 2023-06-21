import { Schema } from "mongoose";
import * as mongoose from "mongoose";
import { IPost } from "../interface/post.interface";

export const PostSchema = new Schema(
    {
        title: { type: "string", required: true },
        shortDescription: { type: "string", required: true },
        content: { type: "string", required: true },
        blogId: { type: "string", required: true },
        blogName: { type: "string", required: true },
        extendedLikesInfo: {
            likesCount: { type: "number", default: 0 },
            dislikesCount: { type: "number", default: 0 },
            myStatus: { type: "string", default: "None" },
            newestLikes: [
                {
                    addedAt: { type: "Date" },
                    userId: { type: "string", default: null },
                    login: { type: "string", default: null },
                },
            ],
        },
    },
    { timestamps: true },
);

PostSchema.set("toJSON", {
    transform: function (doc, dto) {
        dto.id = dto._id;
        delete dto._id;
        delete dto.__v;
        delete dto.updatedAt;
        dto.extendedLikesInfo.newestLikes = dto.extendedLikesInfo.newestLikes.map((like: any): any => {
            delete like._id;
            return like;
        });
    },
});

export const PostModel = mongoose.model<IPost>("Post", PostSchema);

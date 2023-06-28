import mongoose, { Schema } from "mongoose";
import { IComment, ICommentFullInformation } from "../interface/comment.interface";

export const CommentsSchema = new Schema(
    {
        content: { type: "string", required: true },
        postId: { type: "string", required: true },
        commentatorInfo: {
            userId: { type: "string", required: true },
            userLogin: { type: "string", required: true },
        },
        likesInfo: {
            likesCount: { type: "number", default: 0 },
            dislikesCount: { type: "number", default: 0 },
            myStatus: { type: "string", default: "None" },
        },
        postInfo: {
            id: { type: "string", required: true },
            title: { type: "string", required: true },
            blogId: { type: "string", required: true },
            blogName: { type: "string", required: true },
        },
    },
    { timestamps: true },
);

CommentsSchema.set("toJSON", {
    transform: function (doc, dto) {
        dto.id = dto._id;
        delete dto._id;
        delete dto.__v;
        delete dto.updatedAt;
        delete dto.postId;
    },
});

CommentsSchema.set("id", true);

export const CommentModel = mongoose.model<IComment | ICommentFullInformation>("Comment", CommentsSchema);

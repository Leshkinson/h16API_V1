import mongoose, { Schema } from "mongoose";
import { IBlog, IBlogWithUserId } from "../interface/blog.interface";

export const BlogSchema = new Schema(
    {
        name: { type: "string", required: true },
        description: { type: "string", required: true },
        websiteUrl: { type: "string", required: true },
        isMembership: { type: "boolean", required: true },
        userId: { type: "string", required: true },
        banInfo: {
            isBanned: { type: "boolean", default: false },
            banDate: { type: "Date", default: null },
        },
    },
    { timestamps: true },
);

BlogSchema.set("toJSON", {
    transform: function (doc, dto) {
        dto.id = dto._id;
        delete dto._id;
        delete dto.__v;
        delete dto.updatedAt;
        delete dto.userId;
    },
});

BlogSchema.set("id", true);

export const BlogModel = mongoose.model<IBlog | IBlogWithUserId>("Blog", BlogSchema);

import mongoose, { Schema } from "mongoose";
import { BanListSchema } from "./ban-list.schema";
import { IBanListForBlog } from "../interface/ban-list-for-blog.interface";

export const BanListForBlogSchema = new Schema(
    {
        blogId: { type: mongoose.Types.ObjectId, required: true },
    },
    { timestamps: true },
);

BanListForBlogSchema.set("toJSON", {
    transform: function (doc, dto) {
        dto.id = dto._id;
        delete dto._id;
        delete dto.__v;
        delete dto.updatedAt;
    },
});

BanListForBlogSchema.set("id", true);
export const BanListForBlogModel = mongoose.model<IBanListForBlog>("BanListForBlog", BanListForBlogSchema);

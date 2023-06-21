import mongoose, { Schema } from "mongoose";
import { IBanList } from "../interface/ban-list.interface";

export const BanListSchema = new Schema(
    {
        userId: { type: mongoose.Types.ObjectId, required: true },
    },
    { timestamps: true },
);

BanListSchema.set("toJSON", {
    transform: function (doc, dto) {
        dto.id = dto._id;
        delete dto._id;
        delete dto.__v;
        delete dto.updatedAt;
    },
});

BanListSchema.set("id", true);
export const BanListModel = mongoose.model<IBanList>("BanList", BanListSchema);

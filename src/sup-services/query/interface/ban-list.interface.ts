import mongoose from "mongoose";

export interface IBanList {
    _id: mongoose.Schema.Types.ObjectId;
    userId: string;
    //createdAt: Date;
}

import mongoose, { Schema } from "mongoose";
import { ISession } from "../interface/session.interface";

export const SessionSchema = new Schema(
    {
        ip: { type: "string", required: true },
        title: { type: "string", required: true },
        lastActiveDate: { type: "string", required: true },
        deviceId: { type: "string", required: true },
        userId: { type: "string", required: true },
    },
    { timestamps: true },
);

SessionSchema.set("toJSON", {
    transform: function (doc, dto) {
        dto.id = dto._id;
        delete dto.id;
        delete dto._id;
        delete dto.__v;
        delete dto.updatedAt;
        delete dto.userId;
        delete dto.createdAt;
    },
});

SessionSchema.set("id", true);

export const SessionModel = mongoose.model<ISession>("Session", SessionSchema);

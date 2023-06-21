import mongoose from "mongoose";

export interface ISession {
    _id: mongoose.Schema.Types.ObjectId;
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
    userId: string;
}

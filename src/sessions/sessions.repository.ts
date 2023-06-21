import { Model, RefType } from "mongoose";
import { Inject } from "@nestjs/common";
import { ISession } from "./interface/session.interface";

export class SessionsRepository {
    constructor(@Inject("SESSION_MODEL") private readonly sessionModel: Model<ISession>) {}

    public async createDeviceSession(
        ip: string,
        title: string,
        userId: string,
        date: string,
        deviceId: string,
    ): Promise<ISession> {
        return await this.sessionModel.create({ ip, title, userId, lastActiveDate: date, deviceId });
    }

    public async find(deviceId: string): Promise<ISession | null> {
        return this.sessionModel.findOne({ deviceId: deviceId });
    }

    public async update(deviceId: string, date: string): Promise<ISession | null> {
        return this.sessionModel.findOneAndUpdate(
            { deviceId: deviceId },
            {
                lastActiveDate: date,
            },
            {
                new: true,
            },
        );
    }

    public async findAll(userId: string): Promise<ISession[] | null> {
        return this.sessionModel.find({ userId: userId });
    }

    public async deleteAllWithExcept(userId: string, deviceId: string): Promise<void> {
        await this.sessionModel.deleteMany({ $and: [{ userId: userId }, { deviceId: { $ne: deviceId } }] });
    }

    public async deleteAllForBanUser(userId: string | RefType): Promise<void> {
        await this.sessionModel.deleteMany({ userId: userId });
    }

    public async deleteOne(userId: string, deviceId: string): Promise<void> {
        await this.sessionModel.deleteOne({ $and: [{ userId: userId }, { deviceId: deviceId }] });
    }
}

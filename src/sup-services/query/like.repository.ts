import { Model, RefType } from "mongoose";
import { Inject, Injectable } from "@nestjs/common";
import { LikesStatusType } from "./types/like.type";
import { ILikeStatus, ILikeStatusWithoutId } from "./interface/like.interface";
import { IBanList } from "./interface/ban-list.interface";

@Injectable()
export class LikesRepository {
    constructor(@Inject("Like") private readonly likeModel: Model<ILikeStatus | ILikeStatusWithoutId>) {}

    public async createLike(
        commentOrPostId: string,
        userId: string,
        likeStatus: LikesStatusType,
    ): Promise<ILikeStatus | ILikeStatusWithoutId> {
        return this.likeModel.create({ userId, likeStatus, commentOrPostId });
    }

    public async updateLikeStatus(
        id: RefType,
        likeStatus: LikesStatusType,
    ): Promise<ILikeStatus | ILikeStatusWithoutId | null> {
        return this.likeModel.findOneAndUpdate({ _id: id }, { likeStatus: likeStatus });
    }

    public async findLike(userId: string, commentOrPostId: string): Promise<ILikeStatus | ILikeStatusWithoutId | null> {
        return this.likeModel.findOne({ $and: [{ userId }, { commentOrPostId }] });
    }

    public async findLikeById(id: RefType): Promise<ILikeStatus | null> {
        return this.likeModel.findById(id);
    }

    public async findLikes(
        id: RefType,
        arrayUserIdBanList: string[],
    ): Promise<ILikeStatus[] | ILikeStatusWithoutId[] | null> {
        return this.likeModel
            .find(
                { $and: [{ commentOrPostId: id }, { likeStatus: "Like" }, { userId: { $nin: arrayUserIdBanList } }] },
                { _id: 0 },
            )
            .sort({ createdAt: "desc" })
            .limit(3)
            .lean();
    }

    public async countingLikeOrDislike(
        commentOrPostId: string,
        param: string,
        arrayUserIdBanList: string[],
    ): Promise<number> {
        return this.likeModel
            .find({
                $and: [
                    { commentOrPostId: commentOrPostId },
                    { likeStatus: param },
                    { userId: { $nin: arrayUserIdBanList } },
                ],
            })
            .count();
    }

    public async deleteAll() {
        return this.likeModel.deleteMany();
    }
}

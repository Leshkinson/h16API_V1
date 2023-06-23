import { Inject, Injectable } from "@nestjs/common";
import { Model, RefType, SortOrder } from "mongoose";
import { IComment } from "./interface/comment.interface";

@Injectable()
export class CommentsRepository {
    constructor(@Inject("Comment") private readonly commentModel: Model<IComment>) {}

    public async create(content: string, postId: RefType, userId: string, userLogin: string): Promise<IComment> {
        return this.commentModel.create({ content, postId, commentatorInfo: { userId, userLogin } });
    }

    public async updateComment(id: RefType, content: string): Promise<IComment | null> {
        return this.commentModel.findOneAndUpdate({ _id: id }, { content });
    }

    public async find(id: RefType): Promise<IComment | null> {
        return this.commentModel.findById({ _id: id });
    }

    public async delete(id: RefType) {
        return this.commentModel.findOneAndDelete({ _id: id });
    }

    public async deleteAll() {
        return this.commentModel.deleteMany();
    }

    public async findAllForThePost(
        postId: string | string[],
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
        skip: number,
        limit: number,
    ): Promise<IComment[]> {
        const filter = Array.isArray(postId) ? { postId: { $in: postId } } : { postId: postId };
        return this.commentModel
            .find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit);
    }

    public async getCount(postId: string | string[]) {
        const filter = Array.isArray(postId) ? { postId: { $in: postId } } : { postId: postId };
        return this.commentModel.find(filter).count();
    }
}

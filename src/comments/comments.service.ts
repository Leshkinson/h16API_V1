import { RefType } from "mongoose";
import { Inject, Injectable } from "@nestjs/common";
import { CommentModel } from "./schema/comments.schema";
import { IComment } from "./interface/comment.interface";
import { CommentsRepository } from "./comments.repository";

@Injectable()
export class CommentsService {
    constructor(@Inject("commentRepository") private readonly commentRepository: CommentsRepository) {
        this.commentRepository = new CommentsRepository(CommentModel);
    }

    public async find(id: RefType): Promise<IComment | undefined> {
        const comment = await this.commentRepository.find(id);
        if (!comment) throw new Error();

        return comment;
    }

    public async update(id: RefType, content: string): Promise<IComment | undefined> {
        const updateComment: IComment | undefined | null = await this.commentRepository.updateComment(id, content);
        if (updateComment) return updateComment;
        throw new Error();
    }

    public async getOne(id: RefType): Promise<IComment | undefined> {
        const findComment: IComment | undefined = await this.find(id);
        if (findComment) return findComment;
        throw new Error();
    }

    public async delete(id: RefType): Promise<IComment> {
        const deleteComment = await this.commentRepository.delete(id);
        if (deleteComment) return deleteComment;
        throw new Error();
    }

    public async testingDelete(): Promise<void> {
        await this.commentRepository.deleteAll();
    }
}

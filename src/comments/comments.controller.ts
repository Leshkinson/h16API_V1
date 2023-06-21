import { Response, Request } from "express";
import { AccessGuard } from "../auth/access.guard";
import { AuthService } from "../auth/auth.service";
import { CommentsService } from "./comments.service";
import { UsersService } from "../users/users.service";
import { IComment } from "./interface/comment.interface";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { JWT, LIKE_STATUS, TAG_REPOSITORY } from "../const/const";
import { QueryService } from "../sup-services/query/query.service";
import { RequestWithUser } from "../auth/interface/auth.interface";
import { LikesStatusCfgValues } from "../sup-services/query/types/like.type";
import { CreateLikeStatusDto } from "../sup-services/query/dto/create-like.dto";
import { Controller, Get, Body, Param, Delete, Put, Res, HttpStatus, Req, UseGuards } from "@nestjs/common";

@Controller("comments")
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly queryService: QueryService,
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Get(":id")
    async findOne(@Param("id") id: string, @Req() req: Request, @Res() res: Response) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const findComment: IComment | undefined = await this.commentsService.getOne(id);
            if (findComment) {
                if (token) {
                    const payload = (await this.authService.getPayloadByAccessToken(token)) as JWT;
                    const user = await this.usersService.getUserById(payload.id);
                    if (user.banInfo.isBanned) throw new Error();
                    if (user) {
                        findComment.likesInfo.likesCount = await this.queryService.getTotalCountLikeOrDislike(
                            id,
                            LIKE_STATUS.LIKE,
                            TAG_REPOSITORY.CommentsRepository,
                        );
                        findComment.likesInfo.dislikesCount = await this.queryService.getTotalCountLikeOrDislike(
                            id,
                            LIKE_STATUS.DISLIKE,
                            TAG_REPOSITORY.CommentsRepository,
                        );
                        const myStatus = (await this.queryService.getLikeStatus(
                            String(user._id),
                            String(findComment._id),
                        )) as LikesStatusCfgValues;
                        if (myStatus) findComment.likesInfo.myStatus = myStatus;
                        res.status(HttpStatus.OK).json(findComment);

                        return;
                    }
                }
                const user = await this.usersService.getUserById(findComment.commentatorInfo.userId);
                if (user.banInfo.isBanned) throw new Error();
                findComment.likesInfo.likesCount = await this.queryService.getTotalCountLikeOrDislike(
                    id,
                    LIKE_STATUS.LIKE,
                    TAG_REPOSITORY.CommentsRepository,
                );
                findComment.likesInfo.dislikesCount = await this.queryService.getTotalCountLikeOrDislike(
                    id,
                    LIKE_STATUS.DISLIKE,
                    TAG_REPOSITORY.CommentsRepository,
                );
                console.log("findComment", findComment);
                res.status(HttpStatus.OK).json(findComment);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
    @UseGuards(AccessGuard)
    @Put(":commentId")
    async update(
        @Param("commentId") commentId: string,
        @Req() req: Request,
        @Res() res: Response,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            if (userId) {
                const user = await this.usersService.getUserById(userId);
                const comment: IComment | undefined = await this.commentsService.getOne(commentId);
                if (!user || !comment) {
                    res.sendStatus(HttpStatus.NOT_FOUND);

                    return;
                }
                if (comment?.commentatorInfo.userLogin !== user?.login) {
                    res.sendStatus(HttpStatus.FORBIDDEN);

                    return;
                }
                if (comment?.commentatorInfo.userId !== user?._id.toString()) {
                    res.sendStatus(HttpStatus.FORBIDDEN);

                    return;
                }
                const updatedComment: IComment | undefined = await this.commentsService.update(
                    commentId,
                    createCommentDto.content,
                );

                if (updatedComment) res.sendStatus(HttpStatus.NO_CONTENT);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
    @UseGuards(AccessGuard)
    @Delete(":commentId")
    async delete(@Param("commentId") id: string, @Req() req: Request, @Res() res: Response) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            if (userId) {
                const user = await this.usersService.getUserById(userId);

                if (!user) {
                    res.sendStatus(HttpStatus.NOT_FOUND);

                    return;
                }

                const comment: IComment | undefined = await this.commentsService.getOne(id);

                if (!comment) {
                    res.sendStatus(HttpStatus.NOT_FOUND);

                    return;
                }
                if (comment?.commentatorInfo.userLogin !== user?.login) {
                    res.sendStatus(HttpStatus.FORBIDDEN);

                    return;
                }

                if (comment?.commentatorInfo.userId !== user?._id.toString()) {
                    res.sendStatus(HttpStatus.FORBIDDEN);

                    return;
                }

                await this.commentsService.delete(id);

                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
    @UseGuards(AccessGuard)
    @Put(":commentId/like-status")
    async sendLikeOrDislikeStatus(
        @Param("commentId") commentId: string,
        @Req() req: Request,
        @Res() res: Response,
        @Body() createLikeStatusDto: CreateLikeStatusDto,
    ) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            if (userId) {
                await this.queryService.setUpLikeOrDislikeStatus(
                    userId,
                    commentId,
                    createLikeStatusDto.likeStatus,
                    TAG_REPOSITORY.CommentsRepository,
                );

                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
}

import { RefType } from "mongoose";
import { AuthGuard } from "../auth.guard";
import { Request, Response } from "express";
import { PostsService } from "./posts.service";
import { PostsRequest } from "./types/post.types";
import { AuthService } from "../auth/auth.service";
import { IPost } from "./interface/post.interface";
import { AccessGuard } from "../auth/access.guard";
import { UsersService } from "../users/users.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { CommentsRequest } from "../comments/types/comment.type";
import { JWT, LIKE_STATUS, TAG_REPOSITORY } from "../const/const";
import { QueryService } from "../sup-services/query/query.service";
import { IComment } from "../comments/interface/comment.interface";
import { RequestWithUser } from "../auth/interface/auth.interface";
import { CreateCommentDto } from "../comments/dto/create-comment.dto";
import { LikesStatusCfgValues } from "../sup-services/query/types/like.type";
import { CreateLikeStatusDto } from "../sup-services/query/dto/create-like.dto";
import { Controller, Get, Post, Body, Put, Param, Delete, Res, HttpStatus, Req, UseGuards } from "@nestjs/common";

@Controller("posts")
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly queryService: QueryService,
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) {}

    @Post()
    @AuthGuard()
    public async create(@Body() createPostDto: CreatePostDto, @Res() res: Response) {
        try {
            const newPost: IPost | undefined = await this.postsService.create(createPostDto);
            if (newPost) {
                res.status(HttpStatus.CREATED).json(newPost);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }

    @Get()
    public async getAllPosts(@Req() req: Request, @Res() res: Response) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            // eslint-disable-next-line prefer-const
            let { pageNumber, pageSize, sortBy, sortDirection } = req.query as PostsRequest;
            pageNumber = Number(pageNumber ?? 1);
            pageSize = Number(pageSize ?? 10);
            const arrayBlogIdBanList = await this.queryService.getArrayBlogIdBanList();
            const posts: IPost[] = await this.postsService.findAllPosts(
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                arrayBlogIdBanList,
            );
            const totalCount: number = await this.postsService.getTotalCountForPosts();
            if (posts) {
                res.status(HttpStatus.OK).json({
                    pagesCount: Math.ceil(totalCount / pageSize),
                    page: pageNumber,
                    pageSize: pageSize,
                    totalCount: totalCount,
                    items: await this.queryService.getUpgradePosts(posts, token, TAG_REPOSITORY.PostsRepository),
                });
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }

    @Get(":id")
    public async getOne(@Param("id") id: string, @Req() req: Request, @Res() res: Response) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            const arrayBlogIdBanList = await this.queryService.getArrayBlogIdBanList();
            const findPost = await this.postsService.findOne(id, arrayBlogIdBanList);
            //console.log("findPost", findPost);
            if (findPost) {
                const newFindPost = await this.queryService.getUpgradePosts(
                    findPost,
                    token,
                    TAG_REPOSITORY.PostsRepository,
                );
                res.status(HttpStatus.OK).json(newFindPost);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }

    @Put(":id")
    @AuthGuard()
    public async update(@Param("id") id: string, @Res() res: Response, @Body() updatePostDto: UpdatePostDto) {
        try {
            const updatePost: IPost | undefined = await this.postsService.update(id, updatePostDto);
            if (updatePost) {
                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }

    @Delete(":id")
    @AuthGuard()
    public async delete(@Param("id") id: RefType, @Res() res: Response) {
        try {
            await this.postsService.delete(id);

            res.sendStatus(HttpStatus.NO_CONTENT);
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
    @UseGuards(AccessGuard)
    @Post(":postId/comments")
    public async createCommentThePost(
        @Param("postId") postId: string,
        @Body() createCommentDto: CreateCommentDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            if (userId) {
                const newComment: IComment | undefined = await this.queryService.createCommentForThePost(
                    postId,
                    createCommentDto.content,
                    userId,
                );
                if (newComment) {
                    res.status(HttpStatus.CREATED).json(newComment);
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
    @Get(":postId/comments")
    public async getAllCommentsForThePost(@Param("postId") postId: string, @Req() req: Request, @Res() res: Response) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            // eslint-disable-next-line prefer-const
            let { pageNumber, pageSize, sortDirection, sortBy } = req.query as CommentsRequest;
            pageNumber = Number(pageNumber ?? 1);
            pageSize = Number(pageSize ?? 10);

            const comments: IComment[] = await this.queryService.getCommentsForThePost(
                postId,
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
            );
            const totalCount: number = await this.queryService.getTotalCountCommentsForThePost(postId);
            if (token) {
                const payload = (await this.authService.getPayloadByAccessToken(token)) as JWT;
                const user = await this.usersService.getUserById(payload.id);
                if (user) {
                    const upgradeComments: Promise<IComment>[] = comments.map(async (comment: IComment) => {
                        comment.likesInfo.likesCount = await this.queryService.getTotalCountLikeOrDislike(
                            String(comment._id),
                            LIKE_STATUS.LIKE,
                            TAG_REPOSITORY.CommentsRepository,
                        );
                        comment.likesInfo.dislikesCount = await this.queryService.getTotalCountLikeOrDislike(
                            String(comment._id),
                            LIKE_STATUS.DISLIKE,
                            TAG_REPOSITORY.CommentsRepository,
                        );
                        const myStatus = (await this.queryService.getLikeStatus(
                            String(user._id),
                            String(comment._id),
                        )) as LikesStatusCfgValues;
                        if (myStatus) comment.likesInfo.myStatus = myStatus;

                        return comment;
                    });

                    res.status(200).json({
                        pagesCount: Math.ceil(totalCount / pageSize),
                        page: pageNumber,
                        pageSize: pageSize,
                        totalCount: totalCount,
                        items: await Promise.all(upgradeComments),
                    });

                    return;
                }
            }

            const upgradeComments = comments.map(async (comment) => {
                comment.likesInfo.likesCount = await this.queryService.getTotalCountLikeOrDislike(
                    String(comment._id),
                    LIKE_STATUS.LIKE,
                    TAG_REPOSITORY.CommentsRepository,
                );
                comment.likesInfo.dislikesCount = await this.queryService.getTotalCountLikeOrDislike(
                    String(comment._id),
                    LIKE_STATUS.DISLIKE,
                    TAG_REPOSITORY.CommentsRepository,
                );

                return comment;
            });
            res.status(200).json({
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCount,
                items: await Promise.all(upgradeComments),
            });
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(404);
                console.log(error.message);
            }
        }
    }
    @UseGuards(AccessGuard)
    @Put(":postId/like-status")
    public async sendLikeOrDislikeStatus(
        @Param("postId") postId: string,
        @Body() createLikeStatusDto: CreateLikeStatusDto,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            if (userId) {
                await this.queryService.setUpLikeOrDislikeStatus(
                    userId,
                    postId,
                    createLikeStatusDto.likeStatus,
                    TAG_REPOSITORY.PostsRepository,
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

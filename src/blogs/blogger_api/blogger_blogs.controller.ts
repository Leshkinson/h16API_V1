import { Request, Response } from "express";
import { BlogsService } from "../blogs.service";
import { BlogsRequest } from "../types/blog.type";
import { IBlog } from "../interface/blog.interface";
import { AccessGuard } from "../../auth/access.guard";
import { CreateBlogDto } from "../dto/create-blog.dto";
import { UpdateBlogDto } from "../dto/update-blog.dto";
import { IPost } from "../../posts/interface/post.interface";
import { RequestWithUser } from "../../auth/interface/auth.interface";
import { QueryService } from "../../sup-services/query/query.service";
import { UpdatePostDtoByQuery } from "../../posts/dto/update-post.dto";
import { CreatePostDtoWithoutIdAndName } from "../../posts/dto/create-post.dto";
import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    Req,
    Res,
    UseGuards,
} from "@nestjs/common";

@Controller("blogger/blogs")
export class BloggerBlogsController {
    constructor(private readonly blogsService: BlogsService, private readonly queryService: QueryService) {}

    @UseGuards(AccessGuard)
    @Get()
    public async findAllBlogs(@Req() req: Request, @Res() res: Response) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            // eslint-disable-next-line prefer-const
            let { pageNumber, pageSize, sortBy, searchNameTerm, sortDirection } = req.query as BlogsRequest;
            pageNumber = Number(pageNumber ?? 1);
            pageSize = Number(pageSize ?? 10);
            const blogs: IBlog[] = await this.blogsService.findAllBlogsForBloggers(
                searchNameTerm,
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                userId,
            );
            const totalCount: number = await this.blogsService.getTotalCountForBlogs(searchNameTerm, userId);

            res.status(HttpStatus.OK).json({
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCount,
                items: blogs,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
    @UseGuards(AccessGuard)
    @Post()
    public async create(@Body() createBlogDto: CreateBlogDto, @Req() req: Request, @Res() res: Response) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            console.log("userId", userId);
            const newBlog: IBlog = await this.blogsService.createBlog(createBlogDto, userId);
            res.status(HttpStatus.CREATED).json(newBlog);
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
    @UseGuards(AccessGuard)
    @Put(":id")
    public async update(
        @Param("id") id: string,
        @Res() res: Response,
        @Req() req: Request,
        @Body() updateBlogDto: UpdateBlogDto,
    ) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            console.log("userId in controller", userId);
            const updateBlog = await this.blogsService.update(id, userId, updateBlogDto);
            if (updateBlog) {
                res.sendStatus(HttpStatus.NO_CONTENT);

                return;
            }
            throw new NotFoundException();
        } catch (error) {
            if (error instanceof NotFoundException) {
                console.log("here Error");
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
                return;
            }
            if (error instanceof ForbiddenException) {
                console.log("here ForbiddenException");
                res.sendStatus(HttpStatus.FORBIDDEN);
                console.log(error.message);
                return;
            }
        }
    }
    @UseGuards(AccessGuard)
    @Delete(":id")
    public async delete(@Param("id") id: string, @Req() req: Request, @Res() res: Response) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            const deleteBlog = await this.blogsService.delete(id, userId);
            if (deleteBlog) {
                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                console.log("here Error");
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
                return;
            }
            if (error instanceof ForbiddenException) {
                console.log("here ForbiddenException");
                res.sendStatus(HttpStatus.FORBIDDEN);
                console.log(error.message);
                return;
            }
        }
    }
    @UseGuards(AccessGuard)
    @Post(":blogId/posts")
    public async createPostTheBlog(
        @Param("blogId") blogId: string,
        @Body() createPostDtoWithoutIdAndName: CreatePostDtoWithoutIdAndName,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            const newPost: IPost | undefined = await this.queryService.createPostForTheBlog(
                createPostDtoWithoutIdAndName,
                blogId,
                userId,
            );
            if (newPost) res.status(HttpStatus.CREATED).json(newPost);
        } catch (error) {
            if (error instanceof NotFoundException) {
                console.log("here Error");
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
                return;
            }
            if (error instanceof ForbiddenException) {
                console.log("here ForbiddenException");
                res.sendStatus(HttpStatus.FORBIDDEN);
                console.log(error.message);
                return;
            }
        }
    }
    @UseGuards(AccessGuard)
    @Put(":blogId/posts/:postId")
    public async updateExistingPost(
        @Param("blogId") blogId: string,
        @Param("postId") postId: string,
        @Req() req: Request,
        @Res() res: Response,
        @Body() updatePostDtoByQuery: UpdatePostDtoByQuery,
    ) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            console.log("userId in query", userId);
            const updatePost: IPost | undefined | boolean = await this.queryService.updatePostForTheBlog(
                postId,
                blogId,
                userId,
                updatePostDtoByQuery,
            );
            if (updatePost) {
                res.sendStatus(HttpStatus.NO_CONTENT);

                return;
            }
            throw new NotFoundException();
        } catch (error) {
            if (error instanceof NotFoundException) {
                console.log("here Error");
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
                return;
            }
            if (error instanceof ForbiddenException) {
                console.log("here ForbiddenException");
                res.sendStatus(HttpStatus.FORBIDDEN);
                console.log(error.message);
                return;
            }
        }
    }

    @UseGuards(AccessGuard)
    @Delete(":blogId/posts/:postId")
    public async deletePost(
        @Param("blogId") blogId: string,
        @Param("postId") postId: string,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const request = req as RequestWithUser;
            const { userId } = request.user;
            const deleteBlog = await this.queryService.deletePostForTheBlog(postId, blogId, userId);
            if (deleteBlog) {
                res.sendStatus(HttpStatus.NO_CONTENT);

                return;
            }
            throw new NotFoundException();
        } catch (error) {
            if (error instanceof NotFoundException) {
                console.log("here Error");
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
                return;
            }
            if (error instanceof ForbiddenException) {
                console.log("here ForbiddenException");
                res.sendStatus(HttpStatus.FORBIDDEN);
                console.log(error.message);
                return;
            }
        }
    }

    @UseGuards(AccessGuard)
    @Get("/comments")
    public async getAllCommentsForTheBlogs(@Req() req: Request, @Res() res: Response) {
        try {
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
}

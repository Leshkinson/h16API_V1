import { Request, Response } from "express";
import { BlogsService } from "../blogs.service";
import { TAG_REPOSITORY } from "../../const/const";
import { IBlog } from "../interface/blog.interface";
import { IPost } from "../../posts/interface/post.interface";
import { QueryService } from "../../sup-services/query/query.service";
import { BlogsRequest, BlogsRequestWithoutSNT } from "../types/blog.type";
import { Controller, Get, HttpStatus, Param, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { FindOneBlogCommand } from "../use-cases/find-one-blog-use-case";
import { CommandBus, QueryBus } from "@nestjs/cqrs";

@Controller("blogs")
export class PublicBlogsController {
    constructor(
        private readonly blogsService: BlogsService,
        private readonly queryService: QueryService,
        private commandBus: CommandBus,
    ) {}

    @Get()
    public async findAllBlogs(@Req() req: Request, @Res() res: Response) {
        try {
            // eslint-disable-next-line prefer-const
            let { pageNumber, pageSize, sortBy, searchNameTerm, sortDirection } = req.query as BlogsRequest;
            pageNumber = Number(pageNumber ?? 1);
            pageSize = Number(pageSize ?? 10);
            const blogs: IBlog[] = await this.blogsService.findAllBlogs(
                searchNameTerm,
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
                "null",
            );
            const totalCount: number = await this.blogsService.getTotalCountForBlogs(searchNameTerm, null);

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

    @Get(":id")
    //@UsePipes(new ValidationPipe({ transform: true }))
    public async findOne(@Param("id") id: string, @Res() res: Response) {
        try {
            const findBlog: IBlog | undefined = await this.commandBus.execute(new FindOneBlogCommand(id));

            res.status(HttpStatus.OK).json(findBlog);
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }

    @Get(":blogId/posts")
    public async getAllPostForTheBlog(@Param("blogId") blogId: string, @Req() req: Request, @Res() res: Response) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            // eslint-disable-next-line prefer-const
            let { pageNumber, pageSize, sortDirection, sortBy } = req.query as BlogsRequestWithoutSNT;
            pageNumber = Number(pageNumber ?? 1);
            pageSize = Number(pageSize ?? 10);

            const posts: IPost[] = await this.queryService.getPostsForTheBlog(
                blogId,
                pageNumber,
                pageSize,
                sortBy,
                sortDirection,
            );
            const totalCount: number = await this.queryService.getTotalCountPostsForTheBlog(blogId);
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
}

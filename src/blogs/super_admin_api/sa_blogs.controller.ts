import { Controller, Get, HttpStatus, Param, Put, Req, Res } from "@nestjs/common";
import { BlogsService } from "../blogs.service";
import { QueryService } from "../../sup-services/query/query.service";
import { Request, Response } from "express";
import { BlogsRequest } from "../types/blog.type";
import { IBlog } from "../interface/blog.interface";
import { AuthGuard } from "../../auth.guard";

@Controller("sa/blogs")
export class SABlogsController {
    constructor(private readonly blogsService: BlogsService, private readonly queryService: QueryService) {}
    @AuthGuard()
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
                null,
            );
            const totalCount: number = await this.blogsService.getTotalCountForBlogs(searchNameTerm, null);
            const changeBlogs = await this.queryService.changeBlogsForSA(blogs);
            console.log("changeBlogs", changeBlogs);
            res.status(HttpStatus.OK).json({
                pagesCount: Math.ceil(totalCount / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCount,
                items: changeBlogs,
            });
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
    @AuthGuard()
    @Put(":id/bind-with-user/:userId")
    public async bindBlogWithUser(@Param("id") id: string, @Param("userId") userId: string, @Res() res: Response) {
        try {
            const bindBlog = await this.blogsService.bindingBlogWithUser(id, userId);
            if (bindBlog) {
                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }

    @AuthGuard()
    @Put(":id/ban")
    public async banOrUnbanBlog(@Param("id") id: string, @Res() res: Response) {
        try {
        } catch (error) {
            if (error instanceof Error) {
                res.sendStatus(HttpStatus.NOT_FOUND);
                console.log(error.message);
            }
        }
    }
}

import { RefType, SortOrder } from "mongoose";
import { BlogModel } from "./schema/blog.schema";
import { IBlog, IBlogWithUserId } from "./interface/blog.interface";
import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "./blogs.repository";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Injectable()
export class BlogsService {
    constructor(@Inject("blogRepository") private readonly blogRepository: BlogsRepository) {
        this.blogRepository = new BlogsRepository(BlogModel);
    }

    public async createBlog(createBlogDto: CreateBlogDto, userId: string): Promise<IBlog> {
        return this.blogRepository.create(createBlogDto, userId);
    }

    public async findAllBlogs(
        searchNameTerm: string | undefined | object,
        pageNumber = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortDirection: SortOrder | undefined = "desc",
        userId: string | null,
    ): Promise<IBlog[]> {
        if (searchNameTerm)
            searchNameTerm = {
                name: { $regex: new RegExp(`.*${searchNameTerm}.*`, "i") },
            };
        let searchByUserId;
        userId ? (searchByUserId = { userId: userId }) : (searchByUserId = {});
        const skip = Number((pageNumber - 1) * pageSize);
        return this.blogRepository.findAll(searchNameTerm, skip, pageSize, sortBy, sortDirection, searchByUserId);
    }

    public async findAllBlogsForBloggers(
        searchNameTerm: string | undefined | object,
        pageNumber = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortDirection: SortOrder | undefined = "desc",
        userId: string | null,
    ): Promise<IBlog[]> {
        if (searchNameTerm)
            searchNameTerm = {
                name: { $regex: new RegExp(`.*${searchNameTerm}.*`, "i") },
            };
        let searchByUserId;
        userId ? (searchByUserId = { userId: userId }) : (searchByUserId = {});
        const skip = Number((pageNumber - 1) * pageSize);
        return this.blogRepository.findAllForBlogger(
            searchNameTerm,
            skip,
            pageSize,
            sortBy,
            sortDirection,
            searchByUserId,
        );
    }

    public async findOne(id: RefType | string): Promise<IBlog | undefined> {
        const blog = await this.blogRepository.find(id);
        if (!blog) throw new Error();

        return blog;
    }

    public async update(id: RefType, userId: string, updateBlogDto: UpdateBlogDto): Promise<IBlog | undefined> {
        const blog = (await this.blogRepository.find(id)) as IBlogWithUserId;
        if (!blog) throw new NotFoundException();
        if (blog.userId === userId) {
            return await this.blogRepository.updateBlog(id, updateBlogDto);
        }
        throw new ForbiddenException();
    }

    public async delete(id: RefType, userId: string): Promise<IBlog> {
        const blog = (await this.blogRepository.find(id)) as IBlogWithUserId;
        if (!blog) throw new NotFoundException();
        if (blog.userId === userId) {
            return await this.blogRepository.delete(id);
        }
        throw new ForbiddenException();
    }

    public async getTotalCountForBlogs(
        searchNameTerm: string | undefined | object,
        userId: string | null,
    ): Promise<number> {
        let searchByUserId;
        userId ? (searchByUserId = { userId: userId }) : (searchByUserId = {});
        if (searchNameTerm) searchNameTerm = { name: { $regex: new RegExp(`.*${searchNameTerm}.*`, "i") } };

        return await this.blogRepository.getBlogsCount(searchNameTerm, searchByUserId);
    }

    public async bindingBlogWithUser(id: string, userId: string) {
        const blogWithoutOwner = (await this.findOne(id)) as IBlogWithUserId;
        if (!blogWithoutOwner) {
            throw new Error();
        }
        if (blogWithoutOwner.userId === null) {
            return await this.blogRepository.updateBlogByBind(id, userId);
        }
        throw new Error();
    }

    public async testingDelete(): Promise<void> {
        await this.blogRepository.deleteAll();
    }
}

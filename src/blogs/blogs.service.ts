import mongoose, { RefType, SortOrder } from "mongoose";
import { BlogModel } from "./schema/blog.schema";
import { IBlog, IBlogWithUserId } from "./interface/blog.interface";
import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { BlogsRepository } from "./blogs.repository";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";
import { BanBlogDto } from "../users/dto/ban-user.dto";
import { BanListForBlogRepository } from "../sup-services/query/ban-list-for-blog.repository";
import { BanListForBlogModel } from "../sup-services/query/schema/ban-list-for-blog.schema";

@Injectable()
export class BlogsService {
    constructor(
        @Inject("blogRepository") private readonly blogRepository: BlogsRepository,
        @Inject("banListForBlogRepository") private readonly banListForBlogRepository: BanListForBlogRepository,
    ) {
        this.blogRepository = new BlogsRepository(BlogModel);
        this.banListForBlogRepository = new BanListForBlogRepository(BanListForBlogModel);
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

    public async assigningBanToBlog(id: RefType, banBlogDto: BanBlogDto) {
        const candidateBlogForBan = await this.findOne(id);
        if (candidateBlogForBan) {
            throw new Error();
        }

        const banCondition = !candidateBlogForBan.banInfo.isBanned && banBlogDto.isBanned;
        const unBanCondition = candidateBlogForBan.banInfo.isBanned && !banBlogDto.isBanned;
        if (!banCondition && !unBanCondition) {
            return false;
        }

        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            if (banCondition) {
                const banDate = new Date().toISOString();
                candidateBlogForBan.banInfo.isBanned = banBlogDto.isBanned;
                candidateBlogForBan.banInfo.banDate = banDate;
                await candidateBlogForBan.save();
                await this.banListForBlogRepository.addBlogInBanList(id);
            } else {
                candidateBlogForBan.banInfo.isBanned = banBlogDto.isBanned;
                candidateBlogForBan.banInfo.banDate = null;
                await candidateBlogForBan.save();
                await this.banListForBlogRepository.deleteBlogFromBanList(id);
            }
            await session.commitTransaction();
            console.log("success");

            return true;
        } catch (error) {
            console.log("error");
            await session.abortTransaction();

            return false;
        } finally {
            session.endSession().then(() => console.log("Transaction ended"));
        }
    }
}

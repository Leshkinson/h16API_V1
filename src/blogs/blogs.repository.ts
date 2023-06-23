import { IBlog, IBlogWithUserId } from "./interface/blog.interface";
import { Inject, Injectable } from "@nestjs/common";
import { Model, RefType, SortOrder } from "mongoose";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Injectable()
export class BlogsRepository {
    constructor(@Inject("BLOG_MODEL") private readonly blogModel: Model<IBlog>) {}

    public async create(createBlogDto: CreateBlogDto, userId: string): Promise<IBlog> {
        return this.blogModel.create({ ...createBlogDto, isMembership: false, userId: userId });
    }

    public async findAll(
        searchNameTerm: { name: { $regex: RegExp } } | NonNullable<unknown> = {},
        skip = 0,
        limit = 10,
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
        searchByUserId: { userId: string } | NonNullable<unknown>,
    ): Promise<IBlog[]> {
        return this.blogModel
            .find({ $and: [searchNameTerm, searchByUserId] })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit)
            .lean();
    }

    public async findAllForBlogger(
        searchNameTerm: { name: { $regex: RegExp } } | NonNullable<unknown> = {},
        skip = 0,
        limit = 10,
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
        searchByUserId: { userId: string } | NonNullable<unknown>,
    ): Promise<IBlog[]> {
        return this.blogModel
            .find({ $and: [searchNameTerm, searchByUserId] })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit);
    }

    public async find(id: RefType | string): Promise<IBlog | IBlogWithUserId | null> {
        return this.blogModel.findById({ _id: id });
    }

    public async updateBlog(id: RefType, updateBlogDto: UpdateBlogDto): Promise<IBlog | null> {
        return this.blogModel.findOneAndUpdate({ _id: id }, updateBlogDto);
    }

    public async updateBlogByBind(id: RefType, userId: string): Promise<IBlog | null> {
        return this.blogModel.findOneAndUpdate({ _id: id }, { userId: userId });
    }

    public async delete(id: RefType) {
        return this.blogModel.findOneAndDelete({ _id: id });
    }

    public async getBlogsCount(
        searchNameTerm: { name: { $regex: RegExp } } | NonNullable<unknown> = {},
        searchByUserId: { userId: string } | NonNullable<unknown>,
    ): Promise<number> {
        return this.blogModel.countDocuments({ $and: [searchNameTerm, searchByUserId] });
    }

    public async deleteAll() {
        return this.blogModel.deleteMany();
    }

    public async findAllBlogsAll(userId: string): Promise<IBlogWithUserId[]> {
        return this.blogModel.find({ userId: userId });
    }
}

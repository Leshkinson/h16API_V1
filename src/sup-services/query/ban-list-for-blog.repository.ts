import { Model, RefType } from "mongoose";
import { Inject, Injectable } from "@nestjs/common";
import { IBanListForBlog } from "./interface/ban-list-for-blog.interface";

@Injectable()
export class BanListForBlogRepository {
    constructor(@Inject("BanListForBlog") private readonly banListForBlogModel: Model<IBanListForBlog>) {}

    public async addBlogInBanList(blogId: RefType | string): Promise<IBanListForBlog> {
        return this.banListForBlogModel.create({ blogId });
    }

    public async findAllBlogInBanList(): Promise<IBanListForBlog[]> {
        return this.banListForBlogModel.find();
    }

    public async deleteBlogFromBanList(blogId: RefType | string): Promise<void> {
        return this.banListForBlogModel.findOneAndDelete({ blogId });
    }
}

import { IPost } from "./interface/post.interface";
import { Inject, Injectable } from "@nestjs/common";
import { Model, RefType, SortOrder } from "mongoose";
import { UpdatePostDto, UpdatePostDtoByQuery } from "./dto/update-post.dto";
import { CreatePostDto } from "./dto/create-post.dto";

@Injectable()
export class PostsRepository {
    constructor(@Inject("Post") private readonly postModel: Model<IPost>) {}

    public async create(createPostDto: CreatePostDto, blogName: string): Promise<IPost> {
        return this.postModel.create({ ...createPostDto, blogName });
    }

    public async findAll(
        arrayBlogIdBanList: string[],
        blogId?: RefType | object,
        pageNumber = 1,
        limit = 10,
        sortBy = "createdAt",
        skip = 0,
        sortDirection: SortOrder = "desc",
    ): Promise<IPost[]> {
        const filter = blogId ? { blogId } : {};
        return this.postModel
            .find({ $and: [filter, { blogId: { $nin: arrayBlogIdBanList } }] })
            .sort({ [sortBy]: sortDirection })
            .skip(skip)
            .limit(limit);
    }

    public async find(id: RefType): Promise<IPost | null> {
        return this.postModel.findById({ _id: id });
    }

    public async findByPostIdAndBlogId(id: RefType | string, blogId: string) {
        return this.postModel.find({ $and: [{ _id: id }, { blogId: blogId }] });
    }

    public async findAllPostsForAllBlogs(blogIdList: string[]): Promise<IPost[]> {
        return this.postModel.find({ blogId: { $in: blogIdList } });
    }

    public async updatePost(id: RefType, updatePostDto: UpdatePostDto): Promise<IPost | null> {
        return this.postModel.findOneAndUpdate({ _id: id }, updatePostDto);
    }

    public async updatePostByQueryService(
        id: RefType,
        updatePostDtoByQuery: UpdatePostDtoByQuery,
    ): Promise<IPost | null> {
        return this.postModel.findOneAndUpdate({ _id: id }, updatePostDtoByQuery);
    }

    public async deletePost(id: RefType) {
        return this.postModel.findOneAndDelete({ _id: id });
    }

    public async getTotalCount(): Promise<number> {
        return this.postModel.find().count();
    }

    public async getTotalCountWithFilter(param: string): Promise<number> {
        return this.postModel.find({ blogId: param }).count();
    }

    public async deleteAll() {
        return this.postModel.deleteMany();
    }
}

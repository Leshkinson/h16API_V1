import { RefType, SortOrder } from "mongoose";
import { PostModel } from "./schema/post.schema";
import { IPost } from "./interface/post.interface";
import { Inject, Injectable } from "@nestjs/common";
import { PostsRepository } from "./posts.repository";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { BlogModel } from "../blogs/schema/blog.schema";
import { IBlog } from "../blogs/interface/blog.interface";
import { BlogsRepository } from "../blogs/blogs.repository";

@Injectable()
export class PostsService {
    constructor(
        @Inject("postRepository") private readonly postRepository: PostsRepository,
        @Inject("blogRepository") private readonly blogRepository: BlogsRepository,
    ) {
        this.postRepository = new PostsRepository(PostModel);
        this.blogRepository = new BlogsRepository(BlogModel);
    }
    public async create(createPostDto: CreatePostDto) {
        const blog: IBlog | null = await this.blogRepository.find(createPostDto.blogId);
        if (blog) {
            return this.postRepository.create(createPostDto, blog.name);
        }
        throw new Error();
    }

    public async findAllPosts(
        pageNumber = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
        arrayBlogIdBanList: string[],
    ): Promise<IPost[]> {
        const skip: number = (pageNumber - 1) * pageSize;

        return await this.postRepository.findAll(
            arrayBlogIdBanList,
            null,
            pageNumber,
            pageSize,
            sortBy,
            skip,
            sortDirection,
        );
    }

    public async findOne(id: RefType, arrayBlogIdBanList: string[]): Promise<IPost | undefined> {
        const post = await this.postRepository.find(id);
        if (!post) throw new Error();
        const findPost = arrayBlogIdBanList.find((item) => item === post.blogId);
        console.log("findPost", findPost);
        if (typeof findPost === "string" || !findPost) throw new Error();

        return post;
    }
    public async update(id: RefType, updatePostDto: UpdatePostDto): Promise<IPost | undefined> {
        const blog: IBlog | undefined | null = await this.blogRepository.find(updatePostDto.blogId);
        const updatePost: IPost | undefined | null = await this.postRepository.updatePost(id, updatePostDto);
        if (blog && updatePost) {
            updatePost.title = updatePostDto.title;
            updatePost.shortDescription = updatePostDto.shortDescription;
            updatePost.content = updatePostDto.content;

            return updatePost;
        }
        throw new Error();
    }

    public async delete(id: RefType): Promise<IPost> {
        const deletePost = await this.postRepository.deletePost(id);
        if (deletePost) return deletePost;
        throw new Error();
    }
    public async getTotalCountForPosts(): Promise<number> {
        return await this.postRepository.getTotalCount();
    }

    public async testingDelete(): Promise<void> {
        await this.postRepository.deleteAll();
    }
}

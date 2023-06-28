import { RefType, SortOrder } from "mongoose";
import { LikeModel } from "./schema/like.schema";
import { LikesRepository } from "./like.repository";
import { AuthService } from "../../auth/auth.service";
import { BanStatus } from "../../users/types/user.type";
import { BanListModel } from "./schema/ban-list.schema";
import { BanListRepository } from "./ban-list.repository";
import { IBanList } from "./interface/ban-list.interface";
import { UserModel } from "../../users/schema/user.schema";
import { PostModel } from "../../posts/schema/post.schema";
import { BlogModel } from "../../blogs/schema/blog.schema";
import { IPost } from "../../posts/interface/post.interface";
import { IUser } from "../../users/interface/user.interface";
import { PostsRepository } from "../../posts/posts.repository";
import { BlogsRepository } from "../../blogs/blogs.repository";
import { UsersRepository } from "../../users/users.repository";
import { CommentModel } from "../../comments/schema/comments.schema";
import { UpdatePostDtoByQuery } from "../../posts/dto/update-post.dto";
import { CommentsRepository } from "../../comments/comments.repository";
import { LikesStatusCfgValues, LikesStatusType } from "./types/like.type";
import { JWT, LIKE_STATUS, TagRepositoryTypeCfgValues } from "../../const/const";
import { ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ILikeStatus, ILikeStatusWithoutId, UpgradeLikes } from "./interface/like.interface";
import { IComment, ICommentFullInformation } from "../../comments/interface/comment.interface";
import { CreatePostDto, CreatePostDtoWithoutIdAndName } from "../../posts/dto/create-post.dto";
import { IBlog, IBlogWithBlogOwnerInfo, IBlogWithUserId } from "../../blogs/interface/blog.interface";

@Injectable()
export class QueryService {
    constructor(
        private readonly authService: AuthService,
        @Inject("postRepository") private readonly postRepository: PostsRepository,
        @Inject("blogRepository") private readonly blogRepository: BlogsRepository,
        @Inject("likeRepository") private readonly likeRepository: LikesRepository,
        @Inject("userRepository") private readonly userRepository: UsersRepository,
        @Inject("commentRepository") private readonly commentRepository: CommentsRepository,
        @Inject("banListRepository") private readonly banListRepository: BanListRepository,
    ) {
        this.postRepository = new PostsRepository(PostModel);
        this.blogRepository = new BlogsRepository(BlogModel);
        this.likeRepository = new LikesRepository(LikeModel);
        this.userRepository = new UsersRepository(UserModel);
        this.commentRepository = new CommentsRepository(CommentModel);
        this.banListRepository = new BanListRepository(BanListModel);
    }

    public async getTotalCountPostsForTheBlog(blogId: RefType): Promise<number> {
        const blog = await this.blogRepository.find(blogId);

        return this.postRepository.getTotalCountWithFilter(blog?._id?.toString());
    }

    public async createPostForTheBlog(
        createPostDtoWithoutIdAndName: CreatePostDtoWithoutIdAndName,
        blogId: string,
        userId: string,
    ): Promise<IPost> {
        const blog = (await this.blogRepository.find(blogId)) as IBlogWithUserId;
        if (!blog) throw new NotFoundException();
        if (blog.userId === userId) {
            //const blogId = new mongoose.Types.ObjectId((blog?._id).toString());
            const createPostDto = new CreatePostDto(
                createPostDtoWithoutIdAndName.title,
                createPostDtoWithoutIdAndName.shortDescription,
                createPostDtoWithoutIdAndName.content,
                blogId,
            );
            return await this.postRepository.create(createPostDto, blog.name);
        }
        throw new ForbiddenException();
    }

    public async updatePostForTheBlog(
        postId: string,
        blogId: string,
        userId: string,
        updatePostDtoByQuery: UpdatePostDtoByQuery,
    ) {
        const blog = (await this.blogRepository.find(blogId)) as IBlogWithUserId;
        if (!blog) throw new NotFoundException();
        if (blog.userId === userId) {
            const postForLaterUpdate = await this.postRepository.findByPostIdAndBlogId(postId, blogId);
            if (postForLaterUpdate) {
                return await this.postRepository.updatePostByQueryService(postId, updatePostDtoByQuery);
            }
            console.log("here if !postForLaterUpdate");
            throw new ForbiddenException();
        }
        console.log("here if blog.userId !== userId");
        throw new ForbiddenException();
    }

    public async deletePostForTheBlog(postId: string, blogId: string, userId: string) {
        const blog = (await this.blogRepository.find(blogId)) as IBlogWithUserId;
        if (!blog) throw new NotFoundException();
        if (blog.userId === userId) {
            const postForLaterUpdate = await this.postRepository.findByPostIdAndBlogId(postId, blogId);
            if (postForLaterUpdate) {
                return await this.postRepository.deletePost(postId);
            }
            throw new ForbiddenException();
        }
        throw new ForbiddenException();
    }

    public async getPostsForTheBlog(
        blogId: RefType,
        pageNumber = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
    ): Promise<IPost[]> {
        const blog = await this.blogRepository.find(blogId);
        const skip: number = (+pageNumber - 1) * +pageSize;
        if (blog) {
            return this.postRepository.findAll(
                blog?._id?.toString(),
                pageNumber,
                pageSize,
                sortBy,
                skip,
                sortDirection,
            );
        }
        throw new Error();
    }

    public async getTotalCountForUsers(
        searchLoginTerm: string | undefined | object,
        searchEmailTerm: string | undefined | object,
        banStatus: BanStatus = "all",
    ): Promise<number> {
        const banStatusCFG = {
            all: {},
            banned: { "banInfo.isBanned": true },
            notBanned: { "banInfo.isBanned": false },
        };
        if (searchLoginTerm) searchLoginTerm = { login: { $regex: new RegExp(`.*${searchLoginTerm}.*`, "i") } };
        if (searchEmailTerm) searchEmailTerm = { email: { $regex: new RegExp(`.*${searchEmailTerm}.*`, "i") } };

        return await this.userRepository.getUsersCount(searchLoginTerm, searchEmailTerm, banStatusCFG[banStatus]);
    }

    public async getTotalCountForBannedUsersForTheBlog(
        searchLoginTerm: string | undefined | object,
        blogId: string,
    ): Promise<number> {
        if (searchLoginTerm) searchLoginTerm = { login: { $regex: new RegExp(`.*${searchLoginTerm}.*`, "i") } };

        return await this.userRepository.getBannedUsersCount(searchLoginTerm, blogId);
    }

    public async getUpgradePosts(
        posts: IPost[] | IPost,
        token: string | undefined,
        tag: TagRepositoryTypeCfgValues,
    ): Promise<IPost[] | IPost | undefined> {
        if (token) {
            const payload = (await this.authService.getPayloadByAccessToken(token)) as JWT;
            const user = await this.userRepository.find(payload.id);

            return await this.changerPosts(posts, user, tag);
        }

        return await this.changerPosts(posts, null, tag);
    }

    public async changerPosts(
        entityPost: IPost[] | IPost,
        user: IUser | null,
        tag: TagRepositoryTypeCfgValues,
    ): Promise<IPost[] | IPost | undefined> {
        if (Array.isArray(entityPost)) {
            if (user) {
                return await Promise.all(
                    entityPost.map(async (post: IPost): Promise<IPost> => {
                        const myStatus = (await this.getLikeStatus(
                            String(user._id),
                            String(post._id),
                        )) as LikesStatusCfgValues;
                        return await this.postMapper(myStatus, post, tag);
                    }),
                );
            }

            return await Promise.all(
                entityPost.map(async (post: IPost): Promise<IPost> => {
                    return await this.postMapper(null, post, tag);
                }),
            );
        }
        if (user) {
            const myStatus = (await this.getLikeStatus(
                String(user._id),
                String(entityPost._id),
            )) as LikesStatusCfgValues;

            return await this.postMapper(myStatus, entityPost, tag);
        }

        return await this.postMapper(null, entityPost, tag);
    }

    public async postMapper(
        myStatus: LikesStatusCfgValues | null,
        post: IPost,
        tag: TagRepositoryTypeCfgValues,
    ): Promise<IPost> {
        if (myStatus) {
            post.extendedLikesInfo.myStatus = myStatus;
        }
        const likes = (await this.getLikes(String(post._id))) as ILikeStatusWithoutId[];
        post.extendedLikesInfo.likesCount = await this.getTotalCountLikeOrDislike(
            String(post._id),
            LIKE_STATUS.LIKE,
            tag,
        );
        post.extendedLikesInfo.dislikesCount = await this.getTotalCountLikeOrDislike(
            String(post._id),
            LIKE_STATUS.DISLIKE,
            tag,
        );
        post.extendedLikesInfo.newestLikes = (await this.getUpgradeLikes(likes)) as UpgradeLikes[];

        return post;
    }

    public async getTotalCountLikeOrDislike(id: string, param: string, tag: TagRepositoryTypeCfgValues) {
        let commentOrPost: IPost | IComment;
        if (tag === "PostsRepository") {
            commentOrPost = await this.postRepository.find(id);
        }
        if (tag === "CommentsRepository") {
            commentOrPost = await this.commentRepository.find(id);
        }
        if (commentOrPost) {
            const arrayUserIdBanList = await this.getArrayUserIdBanList();
            return await this.likeRepository.countingLikeOrDislike(
                String(commentOrPost._id),
                param,
                arrayUserIdBanList,
            );
        }

        throw new Error();
    }

    public async getLikeStatus(userId: string, commentId: string) {
        const like = await this.likeRepository.findLike(userId, commentId);
        if (like) return like.likeStatus;
    }

    public async getUpgradeLikes(likes: ILikeStatusWithoutId[]): Promise<(UpgradeLikes | undefined)[]> {
        const result: (UpgradeLikes | undefined)[] = await Promise.all(
            likes.map(async (like: ILikeStatusWithoutId): Promise<UpgradeLikes | undefined> => {
                const user = await this.userRepository.find(like.userId);
                if (user) {
                    return {
                        addedAt: like.createdAt,
                        userId: like.userId,
                        login: user.login,
                    };
                }
            }),
        );

        return result.filter((item: UpgradeLikes | undefined) => !!item);
    }

    public async getArrayUserIdBanList(): Promise<string[]> {
        const arrayInBanList = await this.banListRepository.findAllUserInBanList();
        return arrayInBanList.map((item: IBanList) => {
            return item.userId.toString();
        });
    }

    public async getLikes(id: string): Promise<ILikeStatus[] | ILikeStatusWithoutId[] | null> {
        const arrayUserIdBanList = await this.getArrayUserIdBanList();
        return await this.likeRepository.findLikes(id, arrayUserIdBanList);
    }

    public async setUpLikeOrDislikeStatus(
        userId: string,
        commentOrPostId: string,
        likeStatus: LikesStatusType,
        tag: TagRepositoryTypeCfgValues,
    ): Promise<ILikeStatus | ILikeStatusWithoutId | null> {
        const user = await this.userRepository.find(userId);
        let commentOrPost: IPost | IComment | undefined;
        if (tag === "PostsRepository") {
            commentOrPost = await this.postRepository.find(commentOrPostId);
        }
        if (tag === "CommentsRepository") {
            commentOrPost = await this.commentRepository.find(commentOrPostId);
        }
        if (!user || !commentOrPost) {
            throw new Error();
        }
        return await this.makeLikeStatusForTheComment(likeStatus, commentOrPostId, String(user._id));
    }

    public async makeLikeStatusForTheComment(
        likeStatus: LikesStatusType,
        commentOrPostId: string,
        userId: string,
    ): Promise<ILikeStatus | ILikeStatusWithoutId | null> {
        const like = (await this.likeRepository.findLike(userId, commentOrPostId)) as ILikeStatus;
        if (like) {
            return await this.changeLikeStatusForTheComment(String(like._id), likeStatus);
        }

        return await this.likeRepository.createLike(commentOrPostId, userId, likeStatus);
    }

    public async changeLikeStatusForTheComment(
        likeId: string,
        likeStatus: LikesStatusType,
    ): Promise<ILikeStatus | ILikeStatusWithoutId | null> {
        const like = await this.likeRepository.findLikeById(likeId);
        if (like?.likeStatus !== String(likeStatus)) {
            return await this.likeRepository.updateLikeStatus(likeId, likeStatus);
        }

        return like;
    }
    public async createCommentForThePost(postId: RefType, content: string, userId: string): Promise<IComment> {
        const post = await this.postRepository.find(postId);
        if (post) {
            const user = await this.userRepository.find(userId);
            if (user) {
                return await this.commentRepository.create(content, postId, userId, user.login);
            }
        }

        throw new Error();
    }

    public async getCommentsForThePost(
        postId: RefType,
        pageNumber = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
    ): Promise<IComment[]> {
        const post = await this.postRepository.find(postId);
        const skip: number = (+pageNumber - 1) * +pageSize;
        if (post) {
            return await this.commentRepository.findAllForThePost(
                post?._id?.toString(),
                sortBy,
                sortDirection,
                skip,
                +pageSize,
            );
        }
        throw new Error();
    }

    public async getTotalCountCommentsForThePost(postId: RefType): Promise<number> {
        const post = await this.postRepository.find(postId);

        return this.commentRepository.getCount(post?._id?.toString());
    }

    public async testingDelete(): Promise<void> {
        await this.likeRepository.deleteAll();
    }

    public async changeBlogsForSA(blogs: IBlog[]): Promise<any> {
        const changeBlogs = blogs.map(async (blog: IBlogWithBlogOwnerInfo): Promise<any> => {
            const user = await this.userRepository.find(blog.userId);
            // blog.blogOwnerInfo = {
            //     userId: blog.userId,
            //     userLogin: user.login,
            // };
            return {
                id: blog._id,
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
                createdAt: blog.createdAt,
                isMembership: blog.isMembership,
                blogOwnerInfo: {
                    userId: blog.userId,
                    userLogin: user.login,
                },
            };
        });

        return await Promise.all(changeBlogs);
    }

    public async getListIdAllBlogsForUser(userId: string): Promise<string[]> {
        const blogs = await this.blogRepository.findAllBlogsAll(userId);
        return blogs.map((blog: IBlogWithUserId) => blog._id.toString());
    }

    public async getListIdAllPostsForUsersBlog(blogIdList: string[]): Promise<string[]> {
        const posts = await this.postRepository.findAllPostsForAllBlogs(blogIdList);
        return posts.map((post: IPost) => post._id.toString());
    }

    public async getAllCommentsForBloggers(
        pageNumber = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortDirection: SortOrder = "desc",
        userId: string,
    ): Promise<IComment[]> {
        const skip: number = (+pageNumber - 1) * +pageSize;
        const listIdAllBlogs = await this.getListIdAllBlogsForUser(userId);
        const listIdAllPostsForUsersBlog = await this.getListIdAllPostsForUsersBlog(listIdAllBlogs);
        console.log("listIdAllPostsForUsersBlog", listIdAllPostsForUsersBlog);
        return await this.commentRepository.findAllForThePost(
            listIdAllPostsForUsersBlog,
            sortBy,
            sortDirection,
            skip,
            pageSize,
        );
    }

    public async getMapComments(comments): Promise<ICommentFullInformation[]> {
        console.log("comments in queryService");
        return comments.map(async (comment) => {
            const post = await this.postRepository.find(comment.postId);
            console.log("comment before", comment);
            const postInfo = {
                id: post._id.toString(),
                title: post.title,
                blogId: post.blogId,
                blogName: post.blogName,
            };
            comment.postInfo = postInfo;
            console.log("postInfo", postInfo);
            console.log("comment after", comment);
            console.log();
            return comment;
        });
    }

    public async getTotalCountCommentsForTheAllPostForBlogger(userId: string): Promise<number> {
        const listIdAllBlogs = await this.getListIdAllBlogsForUser(userId);
        const listIdAllPostsForUsersBlog = await this.getListIdAllPostsForUsersBlog(listIdAllBlogs);
        return this.commentRepository.getCount(listIdAllPostsForUsersBlog);
    }
}

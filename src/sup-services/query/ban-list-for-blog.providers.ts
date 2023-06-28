import { Connection } from "mongoose";
import { BanListForBlogSchema } from "./schema/ban-list-for-blog.schema";

export const banListProviders = [
    {
        provide: "BAN_LIST_FOR_BLOG_MODEL",
        useFactory: (connection: Connection) => connection.model("BanListForBlog", BanListForBlogSchema),
        inject: ["DATABASE_CONNECTION"],
    },
];

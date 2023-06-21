import { Connection } from "mongoose";
import { BlogSchema } from "./schema/blog.schema";

export const blogsProviders = [
    {
        provide: "BLOG_MODEL",
        useFactory: (connection: Connection) => connection.model("Blog", BlogSchema),
        inject: ["DATABASE_CONNECTION"],
    },
];

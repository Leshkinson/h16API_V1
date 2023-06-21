import { Connection } from "mongoose";
import { CommentsSchema } from "./schema/comments.schema";

export const commentsProviders = [
    {
        provide: "COMMENT_MODEL",
        useFactory: (connection: Connection) => connection.model("Comment", CommentsSchema),
        inject: ["DATABASE_CONNECTION"],
    },
];

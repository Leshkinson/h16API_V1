import { Connection } from "mongoose";
import { LikeSchema } from "./schema/like.schema";

export const likesProviders = [
    {
        provide: "LIKE_MODEL",
        useFactory: (connection: Connection) => connection.model("Like", LikeSchema),
        inject: ["DATABASE_CONNECTION"],
    },
];

import { Connection } from "mongoose";
import { BanListSchema } from "./schema/ban-list.schema";

export const banListProviders = [
    {
        provide: "BAN_LIST_MODEL",
        useFactory: (connection: Connection) => connection.model("BanList", BanListSchema),
        inject: ["DATABASE_CONNECTION"],
    },
];

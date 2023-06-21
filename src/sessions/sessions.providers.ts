import { Connection } from "mongoose";
import { SessionSchema } from "./schema/session.schema";

export const sessionsProviders = [
    {
        provide: "SESSION_MODEL",
        useFactory: (connection: Connection) => connection.model("Session", SessionSchema),
        inject: ["DATABASE_CONNECTION"],
    },
];

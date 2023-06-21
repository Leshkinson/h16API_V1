import * as mongoose from "mongoose";

export const databaseProviders = [
    {
        provide: "DATABASE_CONNECTION",
        useFactory: async (): Promise<typeof mongoose> =>
            await mongoose.connect(
                "mongodb+srv://Oleg_Lopatko:o1l9E9g3@cluster0.dc6pgzh.mongodb.net/?retryWrites=true&w=majority",
            ),
    },
];

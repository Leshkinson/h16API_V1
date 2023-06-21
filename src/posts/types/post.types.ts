import { SortOrder } from "mongoose";

export type PostsRequest = {
    pageNumber?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: string | undefined;
    sortDirection?: SortOrder;
};

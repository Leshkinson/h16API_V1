import { SortOrder } from "mongoose";

export type CommentsRequest = {
    pageNumber?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: string | undefined;
    sortDirection?: SortOrder;
};

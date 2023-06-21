import { SortOrder } from "mongoose";

export type BlogsRequest = {
    pageNumber?: number | undefined;
    pageSize?: number | undefined;
    sortBy?: string | undefined;
    searchNameTerm?: string | undefined;
    sortDirection?: SortOrder;
};

export type BlogsRequestWithoutSNT = {
    pageNumber?: number | undefined;
    pageSize?: number | undefined;
    sizePage?: string | undefined;
    sortBy?: string | undefined;
    sortDirection?: SortOrder;
};

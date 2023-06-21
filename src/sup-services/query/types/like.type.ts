export type LikesStatusType = {
    LIKE: "Like";
    DISLIKE: "Dislike";
    NONE: "None";
};

const LikesStatus_CFG = {
    LIKE: "Like",
    DISLIKE: "Dislike",
    NONE: "None",
} as const;

type LikesStatusCfgKeys = keyof typeof LikesStatus_CFG;
export type LikesStatusCfgValues = (typeof LikesStatus_CFG)[LikesStatusCfgKeys];

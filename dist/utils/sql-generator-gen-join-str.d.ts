import type { ServerQueryParamsJoin, ServerQueryParamsJoinMatchObject } from "../types";
type Param = {
    mtch: ServerQueryParamsJoinMatchObject;
    join: ServerQueryParamsJoin;
    table_name: string;
};
export default function sqlGenGenJoinStr({ join, mtch, table_name }: Param): string;
export {};

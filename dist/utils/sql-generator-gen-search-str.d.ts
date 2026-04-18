import type { ServerQueryParamsJoin, ServerQueryQueryObject, SQLInsertGenValueType } from "../types";
type Param = {
    queryObj: ServerQueryQueryObject[string];
    join?: (ServerQueryParamsJoin | ServerQueryParamsJoin[] | undefined)[];
    field?: string;
    table_name: string;
};
export default function sqlGenGenSearchStr({ queryObj, join, field, table_name, }: Param): {
    str: string;
    values: SQLInsertGenValueType[];
};
export {};

import type { ServerQueryParamsJoin, ServerQueryQueryObject } from "../types";
type Param = {
    queryObj: ServerQueryQueryObject[string];
    join?: (ServerQueryParamsJoin | ServerQueryParamsJoin[] | undefined)[];
    field?: string;
    table_name: string;
};
export default function sqlGenGenSearchStr({ queryObj, join, field, table_name, }: Param): {
    str: string;
    values: (string | number | Float32Array<ArrayBuffer> | Buffer<ArrayBuffer>)[];
};
export {};

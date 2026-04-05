import type { APIResponseObject, SQLInsertGenValueType } from "../../types";
type Params = {
    sql: string;
    values?: SQLInsertGenValueType[];
};
export default function DbSQL<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}>({ sql, values }: Params): Promise<APIResponseObject<T>>;
export {};

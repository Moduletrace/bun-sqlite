import type { APIResponseObject } from "../../types";
type Params = {
    sql: string;
    values?: (string | number)[];
};
export default function DbSQL<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}>({ sql, values }: Params): Promise<APIResponseObject<T>>;
export {};

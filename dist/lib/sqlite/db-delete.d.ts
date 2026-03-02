import type { APIResponseObject, ServerQueryParam } from "../../types";
type Params<Schema extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, Table extends string = string> = {
    table: Table;
    query?: ServerQueryParam<Schema>;
    targetId?: number | string;
};
export default function DbDelete<Schema extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, Table extends string = string>({ table, query, targetId, }: Params<Schema, Table>): Promise<APIResponseObject>;
export {};

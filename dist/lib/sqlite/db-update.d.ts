import type { APIResponseObject, ServerQueryParam } from "../../types";
type Params<Schema extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, Table extends string = string> = {
    table: Table;
    data: Schema;
    query?: ServerQueryParam<Schema>;
    targetId?: number | string;
};
export default function DbUpdate<Schema extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, Table extends string = string>({ table, data, query, targetId, }: Params<Schema, Table>): Promise<APIResponseObject>;
export {};

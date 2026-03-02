import type { APIResponseObject, ServerQueryParam } from "../../types";
type Params<Schema extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, Table extends string = string> = {
    query?: ServerQueryParam<Schema>;
    table: Table;
    count?: boolean;
    targetId?: number | string;
};
export default function DbSelect<Schema extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, Table extends string = string>({ table, query, count, targetId, }: Params<Schema, Table>): Promise<APIResponseObject<Schema>>;
export {};

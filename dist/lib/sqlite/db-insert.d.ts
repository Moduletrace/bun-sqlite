import type { APIResponseObject } from "../../types";
type Params<Schema extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, Table extends string = string> = {
    table: Table;
    data: Schema[];
    update_on_duplicate?: boolean;
};
export default function DbInsert<Schema extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, Table extends string = string>({ table, data, update_on_duplicate, }: Params<Schema, Table>): Promise<APIResponseObject>;
export {};

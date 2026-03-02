import type { APIResponseObject, ServerQueryParam } from "../../types";
type Params<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    table: string;
    data: T;
    query?: ServerQueryParam<T>;
    targetId?: number | string;
};
export default function DbUpdate<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}>({ table, data, query, targetId }: Params<T>): Promise<APIResponseObject>;
export {};

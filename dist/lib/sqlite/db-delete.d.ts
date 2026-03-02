import type { APIResponseObject, ServerQueryParam } from "../../types";
type Params<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    table: string;
    query?: ServerQueryParam<T>;
    targetId?: number | string;
};
export default function DbDelete<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}>({ table, query, targetId }: Params<T>): Promise<APIResponseObject>;
export {};

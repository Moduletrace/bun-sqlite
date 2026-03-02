import type { APIResponseObject, ServerQueryParam } from "../../types";
type Params<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    query?: ServerQueryParam<T>;
    table: string;
    count?: boolean;
    targetId?: number | string;
};
export default function DbSelect<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}>({ table, query, count, targetId }: Params<T>): Promise<APIResponseObject<T>>;
export {};

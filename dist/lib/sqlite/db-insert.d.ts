import type { APIResponseObject } from "../../types";
type Params<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    table: string;
    data: T[];
};
export default function DbInsert<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}>({ table, data }: Params<T>): Promise<APIResponseObject>;
export {};

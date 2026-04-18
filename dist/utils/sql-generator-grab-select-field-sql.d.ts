import type { TableSelectFieldsObject } from "../types";
type Param<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = {
    selectFields: (keyof T | TableSelectFieldsObject<T>)[];
    append_table_names?: boolean;
    table_name: string;
};
export default function sqlGenGrabSelectFieldSQL<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}>({ selectFields, append_table_names, table_name }: Param<T>): string;
export {};

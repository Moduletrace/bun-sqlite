import type { ServerQueryParam, TableSelectFieldsObject } from "../types";
type Param<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = {
    genObject?: ServerQueryParam<T>;
    selectFields?: (keyof T | TableSelectFieldsObject<T>)[];
    append_table_names?: boolean;
    table_name: string;
    full_text_match_str?: string;
    full_text_search_str?: string;
};
export default function sqlGenGenQueryStr<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}>(params: Param<T>): {
    str: string;
    values: any[];
};
export {};

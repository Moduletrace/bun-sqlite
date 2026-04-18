import type { ServerQueryParam, SQLInsertGenValueType } from "../types";
type Param<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = {
    genObject?: ServerQueryParam<T>;
    tableName: string;
    dbFullName?: string;
    count?: boolean;
};
type Return = {
    string: string;
    values: SQLInsertGenValueType[];
};
/**
 * # SQL Query Generator
 * @description Generates an SQL Query for node module `mysql` or `serverless-mysql`
 */
export default function sqlGenerator<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}>({ tableName, genObject, dbFullName, count }: Param<T>): Return;
export {};

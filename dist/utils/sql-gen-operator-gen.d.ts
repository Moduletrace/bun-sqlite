import type { ServerQueryEqualities, ServerQueryObject, SQLInsertGenValueType } from "../types";
type Params = {
    fieldName: string;
    value?: SQLInsertGenValueType;
    equality?: (typeof ServerQueryEqualities)[number];
    queryObj: ServerQueryObject<{
        [key: string]: any;
    }, string>;
    isValueFieldValue?: boolean;
};
type Return = {
    str?: string;
    param?: SQLInsertGenValueType;
};
/**
 * # SQL Gen Operator Gen
 * @description Generates an SQL operator for node module `mysql` or `serverless-mysql`
 */
export default function sqlGenOperatorGen({ fieldName, value, equality, queryObj, isValueFieldValue, }: Params): Return;
export {};

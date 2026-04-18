import type {
    ServerQueryEqualities,
    ServerQueryObject,
    SQLInsertGenValueType,
} from "../types";
import sqlEqualityParser from "./sql-equality-parser";

type Params = {
    fieldName: string;
    value?: SQLInsertGenValueType;
    equality?: (typeof ServerQueryEqualities)[number];
    queryObj: ServerQueryObject<
        {
            [key: string]: any;
        },
        string
    >;
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
export default function sqlGenOperatorGen({
    fieldName,
    value,
    equality,
    queryObj,
    isValueFieldValue,
}: Params): Return {
    if (queryObj.nullValue) {
        return { str: `${fieldName} IS NULL` };
    }

    if (queryObj.notNullValue) {
        return { str: `${fieldName} IS NOT NULL` };
    }

    if (value) {
        const finalValue = isValueFieldValue ? value : "?";
        const finalParams = isValueFieldValue ? undefined : value;

        if (equality == "MATCH") {
            return {
                str: `MATCH(${fieldName}) AGAINST(${finalValue} IN NATURAL LANGUAGE MODE)`,
                param: finalParams,
            };
        } else if (equality == "MATCH_BOOLEAN") {
            return {
                str: `MATCH(${fieldName}) AGAINST(${finalValue} IN BOOLEAN MODE)`,
                param: finalParams,
            };
        } else if (equality == "LIKE_LOWER") {
            return {
                str: `LOWER(${fieldName}) LIKE LOWER(${finalValue})`,
                param: `%${finalParams}%`,
            };
        } else if (equality == "LIKE_LOWER_RAW") {
            return {
                str: `LOWER(${fieldName}) LIKE LOWER(${finalValue})`,
                param: finalParams,
            };
        } else if (equality == "LIKE") {
            return {
                str: `${fieldName} LIKE ${finalValue}`,
                param: `%${finalParams}%`,
            };
        } else if (equality == "LIKE_RAW") {
            return {
                str: `${fieldName} LIKE ${finalValue}`,
                param: finalParams,
            };
        } else if (equality == "NOT_LIKE_LOWER") {
            return {
                str: `LOWER(${fieldName}) NOT LIKE LOWER(${finalValue})`,
                param: `%${finalParams}%`,
            };
        } else if (equality == "NOT_LIKE_LOWER_RAW") {
            return {
                str: `LOWER(${fieldName}) NOT LIKE LOWER(${finalValue})`,
                param: finalParams,
            };
        } else if (equality == "NOT LIKE") {
            return {
                str: `${fieldName} NOT LIKE ${finalValue}`,
                param: finalParams,
            };
        } else if (equality == "NOT LIKE_RAW") {
            return {
                str: `${fieldName} NOT LIKE ${finalValue}`,
                param: finalParams,
            };
        } else if (equality == "REGEXP") {
            return {
                str: `LOWER(${fieldName}) REGEXP LOWER(${finalValue})`,
                param: finalParams,
            };
        } else if (equality == "FULLTEXT") {
            return {
                str: `MATCH(${fieldName}) AGAINST(${finalValue} IN BOOLEAN MODE)`,
                param: finalParams,
            };
        } else if (equality == "NOT EQUAL") {
            return {
                str: `${fieldName} != ${finalValue}`,
                param: finalParams,
            };
        } else if (equality == "IS NOT") {
            return {
                str: `${fieldName} IS NOT ${finalValue}`,
                param: finalParams,
            };
        } else if (equality) {
            return {
                str: `${fieldName} ${sqlEqualityParser(
                    equality,
                )} ${finalValue}`,
                param: finalParams,
            };
        } else {
            return {
                str: `${fieldName} = ${finalValue}`,
                param: finalParams,
            };
        }
    } else {
        if (equality == "IS NULL") {
            return { str: `${fieldName} IS NULL` };
        } else if (equality == "IS NOT NULL") {
            return { str: `${fieldName} IS NOT NULL` };
        } else if (equality) {
            return {
                str: `${fieldName} ${sqlEqualityParser(equality)} ?`,
                param: value,
            };
        } else {
            return {
                str: `${fieldName} = ?`,
                param: value,
            };
        }
    }
}

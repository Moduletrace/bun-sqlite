import type {
    QueryRawValueType,
    ServerQueryParamsJoin,
    ServerQueryQueryObject,
    ServerQueryValuesObject,
    SQLInsertGenValueType,
} from "../types";
import sqlGenOperatorGen from "./sql-gen-operator-gen";

type Param = {
    queryObj: ServerQueryQueryObject[string];
    join?: (ServerQueryParamsJoin | ServerQueryParamsJoin[] | undefined)[];
    field?: string;
    table_name: string;
};

export default function sqlGenGenSearchStr({
    queryObj,
    join,
    field,
    table_name,
}: Param) {
    let sqlSearhValues: SQLInsertGenValueType[] = [];

    const finalFieldName = (() => {
        if (queryObj?.tableName) {
            return `${queryObj.tableName}.${field}`;
        }
        if (join) {
            return `${table_name}.${field}`;
        }
        return field;
    })();

    let str = `${finalFieldName}=?`;

    function grabValue(val?: string | number | ServerQueryValuesObject | null) {
        const valueParsed = val;

        if (!valueParsed) return;

        const valueString =
            typeof valueParsed == "string" || typeof valueParsed == "number"
                ? valueParsed
                : valueParsed
                  ? valueParsed.fieldName && valueParsed.tableName
                      ? `${valueParsed.tableName}.${valueParsed.fieldName}`
                      : valueParsed.value
                  : undefined;

        const valueEquality =
            typeof valueParsed == "object"
                ? valueParsed.equality || queryObj.equality
                : queryObj.equality;

        const operatorStrParam = sqlGenOperatorGen({
            queryObj,
            equality: valueEquality,
            fieldName: finalFieldName || "",
            value: valueString || "",
            isValueFieldValue: Boolean(
                typeof valueParsed == "object" &&
                valueParsed.fieldName &&
                valueParsed.tableName,
            ),
        });

        return operatorStrParam;
    }

    if (Array.isArray(queryObj.value)) {
        const strArray: string[] = [];

        queryObj.value.forEach((val) => {
            const operatorStrParam = grabValue(val);

            if (!operatorStrParam) return;

            if (operatorStrParam.str && operatorStrParam.param) {
                strArray.push(operatorStrParam.str);
                sqlSearhValues.push(operatorStrParam.param);
            } else if (operatorStrParam.str) {
                strArray.push(operatorStrParam.str);
            }
        });

        str = "(" + strArray.join(` ${queryObj.operator || "AND"} `) + ")";
    } else if (typeof queryObj.value == "object") {
        const operatorStrParam = grabValue(queryObj.value);
        if (operatorStrParam?.str) {
            str = operatorStrParam.str;
            if (operatorStrParam.param) {
                sqlSearhValues.push(operatorStrParam.param);
            }
        }
    } else if (queryObj.raw_equality && queryObj.value) {
        str = `${finalFieldName} ${queryObj.raw_equality} ?`;
        sqlSearhValues.push(queryObj.value);
    } else if (queryObj.between) {
        str = `${finalFieldName} BETWEEN ? AND ?`;
        sqlSearhValues.push(queryObj.between.min, queryObj.between.max);
    } else {
        const valueParsed = queryObj.value ? queryObj.value : undefined;

        const operatorStrParam = sqlGenOperatorGen({
            equality: queryObj.equality,
            fieldName: finalFieldName || "",
            value: valueParsed,
            queryObj,
        });

        if (operatorStrParam.str && operatorStrParam.param) {
            str = operatorStrParam.str;
            sqlSearhValues.push(operatorStrParam.param);
        } else if (operatorStrParam.str && !operatorStrParam.str.match(/\?/)) {
            str = operatorStrParam.str;
        } else {
            sqlSearhValues.push(valueParsed || "");
        }
    }

    console.log("str", str);
    console.log("sqlSearhValues", sqlSearhValues);

    return { str, values: sqlSearhValues };
}

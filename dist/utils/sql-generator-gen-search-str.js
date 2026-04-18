import sqlGenOperatorGen from "./sql-gen-operator-gen";
export default function sqlGenGenSearchStr({ queryObj, join, field, table_name, }) {
    let sqlSearhValues = [];
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
    function grabValue(val) {
        const valueParsed = val;
        if (!valueParsed)
            return;
        const valueString = typeof valueParsed == "string" || typeof valueParsed == "number"
            ? valueParsed
            : valueParsed
                ? valueParsed.fieldName && valueParsed.tableName
                    ? `${valueParsed.tableName}.${valueParsed.fieldName}`
                    : valueParsed.value
                : undefined;
        const valueEquality = typeof valueParsed == "object"
            ? valueParsed.equality || queryObj.equality
            : queryObj.equality;
        const operatorStrParam = sqlGenOperatorGen({
            queryObj,
            equality: valueEquality,
            fieldName: finalFieldName || "",
            value: valueString || "",
            isValueFieldValue: Boolean(typeof valueParsed == "object" &&
                valueParsed.fieldName &&
                valueParsed.tableName),
        });
        return operatorStrParam;
    }
    if (Array.isArray(queryObj.value)) {
        const strArray = [];
        queryObj.value.forEach((val) => {
            const operatorStrParam = grabValue(val);
            if (!operatorStrParam)
                return;
            if (operatorStrParam.str && operatorStrParam.param) {
                strArray.push(operatorStrParam.str);
                sqlSearhValues.push(operatorStrParam.param);
            }
            else if (operatorStrParam.str) {
                strArray.push(operatorStrParam.str);
            }
        });
        str = "(" + strArray.join(` ${queryObj.operator || "AND"} `) + ")";
    }
    else if (typeof queryObj.value == "object") {
        const operatorStrParam = grabValue(queryObj.value);
        if (operatorStrParam?.str) {
            str = operatorStrParam.str;
            if (operatorStrParam.param) {
                sqlSearhValues.push(operatorStrParam.param);
            }
        }
    }
    else {
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
        }
        else if (operatorStrParam.str) {
            str = operatorStrParam.str;
        }
    }
    return { str, values: sqlSearhValues };
}

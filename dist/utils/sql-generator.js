import { isUndefined } from "lodash";
import sqlGenOperatorGen from "./sql-gen-operator-gen";
/**
 * # SQL Query Generator
 * @description Generates an SQL Query for node module `mysql` or `serverless-mysql`
 */
export default function sqlGenerator({ tableName, genObject, dbFullName, count }) {
    const finalQuery = genObject?.query ? genObject.query : undefined;
    const queryKeys = finalQuery ? Object.keys(finalQuery) : undefined;
    const sqlSearhValues = [];
    const finalDbName = dbFullName ? `${dbFullName}.` : "";
    /**
     * # Generate Query
     */
    function genSqlSrchStr({ queryObj, join, field, }) {
        const finalFieldName = (() => {
            if (queryObj?.tableName) {
                return `${finalDbName}${queryObj.tableName}.${field}`;
            }
            if (join) {
                return `${finalDbName}${tableName}.${field}`;
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
                        : valueParsed.value?.toString()
                    : undefined;
            const valueEquality = typeof valueParsed == "object"
                ? valueParsed.equality || queryObj.equality
                : queryObj.equality;
            const operatorStrParam = sqlGenOperatorGen({
                queryObj,
                equality: valueEquality,
                fieldName: finalFieldName || "",
                value: valueString?.toString() || "",
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
            const valueParsed = queryObj.value
                ? String(queryObj.value)
                : undefined;
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
        return str;
    }
    function generateJoinStr(mtch, join) {
        if (mtch.__batch) {
            let btch_mtch = ``;
            btch_mtch += `(`;
            for (let i = 0; i < mtch.__batch.matches.length; i++) {
                const __mtch = mtch.__batch.matches[i];
                btch_mtch += `${generateJoinStr(__mtch, join)}`;
                if (i < mtch.__batch.matches.length - 1) {
                    btch_mtch += ` ${mtch.__batch.operator || "OR"} `;
                }
            }
            btch_mtch += `)`;
            return btch_mtch;
        }
        return `${finalDbName}${typeof mtch.source == "object" ? mtch.source.tableName : tableName}.${typeof mtch.source == "object" ? mtch.source.fieldName : mtch.source}=${(() => {
            if (mtch.targetLiteral) {
                if (typeof mtch.targetLiteral == "number") {
                    return `${mtch.targetLiteral}`;
                }
                return `'${mtch.targetLiteral}'`;
            }
            if (join.alias) {
                return `${finalDbName}${typeof mtch.target == "object"
                    ? mtch.target.tableName
                    : join.alias}.${typeof mtch.target == "object"
                    ? mtch.target.fieldName
                    : mtch.target}`;
            }
            return `${finalDbName}${typeof mtch.target == "object"
                ? mtch.target.tableName
                : join.tableName}.${typeof mtch.target == "object"
                ? mtch.target.fieldName
                : mtch.target}`;
        })()}`;
    }
    let fullTextMatchStr = genObject?.fullTextSearch
        ? ` MATCH(${genObject.fullTextSearch.fields
            .map((f) => genObject.join ? `${tableName}.${String(f)}` : `${String(f)}`)
            .join(",")}) AGAINST (? IN BOOLEAN MODE)`
        : undefined;
    const fullTextSearchStr = genObject?.fullTextSearch
        ? genObject.fullTextSearch.searchTerm
            .split(` `)
            .map((t) => `${t}`)
            .join(" ")
        : undefined;
    let queryString = (() => {
        let str = "SELECT";
        if (count) {
            str += ` COUNT(*)`;
        }
        else if (genObject?.selectFields?.[0]) {
            if (genObject.join) {
                str += ` ${genObject.selectFields
                    ?.map((fld) => typeof fld == "object"
                    ? `${finalDbName}${tableName}.${fld.fieldName.toString()}` +
                        (fld.alias ? ` as ${fld.alias}` : ``)
                    : `${finalDbName}${tableName}.${String(fld)}`)
                    .join(",")}`;
            }
            else {
                str += ` ${genObject.selectFields
                    ?.map((fld) => typeof fld == "object"
                    ? `${fld.fieldName.toString()}` +
                        (fld.alias ? ` as ${fld.alias}` : ``)
                    : fld)
                    .join(",")}`;
            }
        }
        else {
            if (genObject?.join) {
                str += ` ${finalDbName}${tableName}.*`;
            }
            else {
                str += " *";
            }
        }
        if (genObject?.countSubQueries) {
            let countSqls = [];
            for (let i = 0; i < genObject.countSubQueries.length; i++) {
                const countSubQuery = genObject.countSubQueries[i];
                if (!countSubQuery)
                    continue;
                const tableAlias = countSubQuery.table_alias;
                let subQStr = `(SELECT COUNT(*)`;
                subQStr += ` FROM ${countSubQuery.table}${tableAlias ? ` ${tableAlias}` : ""}`;
                subQStr += ` WHERE (`;
                for (let j = 0; j < countSubQuery.srcTrgMap.length; j++) {
                    const csqSrc = countSubQuery.srcTrgMap[j];
                    if (!csqSrc)
                        continue;
                    subQStr += ` ${tableAlias || countSubQuery.table}.${csqSrc.src}`;
                    if (typeof csqSrc.trg == "string") {
                        subQStr += ` = ?`;
                        sqlSearhValues.push(csqSrc.trg);
                    }
                    else if (typeof csqSrc.trg == "object") {
                        subQStr += ` = ${csqSrc.trg.table}.${csqSrc.trg.field}`;
                    }
                    if (j < countSubQuery.srcTrgMap.length - 1) {
                        subQStr += ` AND `;
                    }
                }
                subQStr += ` )) AS ${countSubQuery.alias}`;
                countSqls.push(subQStr);
            }
            str += `, ${countSqls.join(",")}`;
        }
        if (genObject?.join && !count) {
            const existingJoinTableNames = [tableName];
            str +=
                "," +
                    genObject.join
                        .flat()
                        .filter((j) => !isUndefined(j))
                        .map((joinObj) => {
                        const joinTableName = joinObj.alias
                            ? joinObj.alias
                            : joinObj.tableName;
                        if (existingJoinTableNames.includes(joinTableName))
                            return null;
                        existingJoinTableNames.push(joinTableName);
                        if (joinObj.selectFields) {
                            return joinObj.selectFields
                                .map((selectField) => {
                                if (typeof selectField == "string") {
                                    return `${finalDbName}${joinTableName}.${selectField}`;
                                }
                                else if (typeof selectField == "object") {
                                    let aliasSelectField = selectField.count
                                        ? `COUNT(${finalDbName}${joinTableName}.${selectField.field})`
                                        : `${finalDbName}${joinTableName}.${selectField.field}`;
                                    if (selectField.alias)
                                        aliasSelectField += ` AS ${selectField.alias}`;
                                    return aliasSelectField;
                                }
                            })
                                .join(",");
                        }
                        else {
                            return `${finalDbName}${joinTableName}.*`;
                        }
                    })
                        .filter((_) => Boolean(_))
                        .join(",");
        }
        if (genObject?.fullTextSearch &&
            fullTextMatchStr &&
            fullTextSearchStr) {
            str += `, ${fullTextMatchStr} AS ${genObject.fullTextSearch.scoreAlias}`;
            sqlSearhValues.push(fullTextSearchStr);
        }
        str += ` FROM ${finalDbName}${tableName}`;
        if (genObject?.join) {
            str +=
                " " +
                    genObject.join
                        .flat()
                        .filter((j) => !isUndefined(j))
                        .map((join) => {
                        return (join.joinType +
                            " " +
                            (join.alias
                                ? `${finalDbName}${join.tableName}` +
                                    " " +
                                    join.alias
                                : `${finalDbName}${join.tableName}`) +
                            " ON " +
                            (() => {
                                if (Array.isArray(join.match)) {
                                    return ("(" +
                                        join.match
                                            .map((mtch) => generateJoinStr(mtch, join))
                                            .join(join.operator
                                            ? ` ${join.operator} `
                                            : " AND ") +
                                        ")");
                                }
                                else if (typeof join.match == "object") {
                                    return generateJoinStr(join.match, join);
                                }
                            })());
                    })
                        .join(" ");
        }
        return str;
    })();
    const sqlSearhString = queryKeys?.map((field) => {
        const queryObj = finalQuery?.[field];
        if (!queryObj)
            return;
        if (queryObj.__query) {
            const subQueryGroup = queryObj.__query;
            const subSearchKeys = Object.keys(subQueryGroup);
            const subSearchString = subSearchKeys.map((_field) => {
                const newSubQueryObj = subQueryGroup?.[_field];
                if (newSubQueryObj) {
                    return genSqlSrchStr({
                        queryObj: newSubQueryObj,
                        field: newSubQueryObj.fieldName || _field,
                        join: genObject?.join,
                    });
                }
            });
            return ("(" +
                subSearchString.join(` ${queryObj.operator || "AND"} `) +
                ")");
        }
        return genSqlSrchStr({
            queryObj,
            field: queryObj.fieldName || field,
            join: genObject?.join,
        });
    });
    const cleanedUpSearchStr = sqlSearhString?.filter((str) => typeof str == "string");
    const isSearchStr = cleanedUpSearchStr?.[0] && cleanedUpSearchStr.find((str) => str);
    if (isSearchStr) {
        const stringOperator = genObject?.searchOperator || "AND";
        queryString += ` WHERE ${cleanedUpSearchStr.join(` ${stringOperator} `)}`;
    }
    if (genObject?.fullTextSearch && fullTextSearchStr && fullTextMatchStr) {
        queryString += `${isSearchStr ? " AND" : " WHERE"} ${fullTextMatchStr}`;
        sqlSearhValues.push(fullTextSearchStr);
    }
    if (genObject?.group) {
        let group_by_txt = ``;
        if (typeof genObject.group == "string") {
            group_by_txt = genObject.group;
        }
        else if (Array.isArray(genObject.group)) {
            for (let i = 0; i < genObject.group.length; i++) {
                const group = genObject.group[i];
                if (typeof group == "string") {
                    group_by_txt += `\`${group.toString()}\``;
                }
                else if (typeof group == "object" && group.table) {
                    group_by_txt += `${group.table}.${String(group.field)}`;
                }
                else if (typeof group == "object") {
                    group_by_txt += `${String(group.field)}`;
                }
                if (i < genObject.group.length - 1) {
                    group_by_txt += ",";
                }
            }
        }
        else if (typeof genObject.group == "object") {
            if (genObject.group.table) {
                group_by_txt = `${genObject.group.table}.${String(genObject.group.field)}`;
            }
            else {
                group_by_txt = `${String(genObject.group.field)}`;
            }
        }
        queryString += ` GROUP BY ${group_by_txt}`;
    }
    function grabOrderString(order) {
        let orderFields = [];
        let orderSrt = ``;
        if (genObject?.fullTextSearch && genObject.fullTextSearch.scoreAlias) {
            orderFields.push(genObject.fullTextSearch.scoreAlias);
        }
        else if (genObject?.join) {
            orderFields.push(`${finalDbName}${tableName}.${String(order.field)}`);
        }
        else {
            orderFields.push(order.field);
        }
        orderSrt += ` ${orderFields.join(", ")} ${order.strategy}`;
        return orderSrt;
    }
    if (genObject?.order && !count) {
        let orderSrt = ` ORDER BY`;
        if (Array.isArray(genObject.order)) {
            for (let i = 0; i < genObject.order.length; i++) {
                const order = genObject.order[i];
                if (order) {
                    orderSrt +=
                        grabOrderString(order) +
                            (i < genObject.order.length - 1 ? `,` : "");
                }
            }
        }
        else {
            orderSrt += grabOrderString(genObject.order);
        }
        queryString += ` ${orderSrt}`;
    }
    if (genObject?.limit && !count)
        queryString += ` LIMIT ${genObject.limit}`;
    if (genObject?.offset && !count)
        queryString += ` OFFSET ${genObject.offset}`;
    return {
        string: queryString,
        values: sqlSearhValues,
    };
}

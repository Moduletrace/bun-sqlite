import { isUndefined } from "lodash";
import sqlGenGrabConcatStr from "./sql-generator-grab-concat-str";
import sqlGenGenJoinStr from "./sql-generator-gen-join-str";
import sqlGenGrabSelectFieldSQL from "./sql-generator-grab-select-field-sql";
export default function sqlGenGenQueryStr(params) {
    let str = "SELECT";
    const genObject = params.genObject;
    const table_name = params.table_name;
    const full_text_match_str = params.full_text_match_str;
    const full_text_search_str = params.full_text_search_str;
    let sqlSearhValues = [];
    if (genObject?.select_sql) {
        str += ` ${genObject.select_sql}`;
    }
    else if (genObject?.selectFields?.[0]) {
        if (genObject.join) {
            str += sqlGenGrabSelectFieldSQL({
                selectFields: genObject.selectFields,
                append_table_names: true,
                table_name,
            });
        }
        else {
            str += sqlGenGrabSelectFieldSQL({
                selectFields: genObject.selectFields,
                table_name,
            });
        }
    }
    else {
        if (genObject?.join) {
            str += ` ${table_name}.*`;
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
    if (genObject?.join) {
        const existingJoinTableNames = [table_name];
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
                    if (joinObj.group_concat) {
                        return sqlGenGrabConcatStr({
                            field: `${joinTableName}.${joinObj.group_concat.field}`,
                            alias: joinObj.group_concat.alias,
                            separator: joinObj.group_concat.separator,
                        });
                    }
                    else if (joinObj.selectFields) {
                        return joinObj.selectFields
                            .map((selectField) => {
                            if (typeof selectField == "string") {
                                return `${joinTableName}.${selectField}`;
                            }
                            else if (typeof selectField == "object") {
                                let aliasSelectField = selectField.count
                                    ? `COUNT(${joinTableName}.${selectField.field})`
                                    : `${joinTableName}.${selectField.field}`;
                                if (selectField.alias)
                                    aliasSelectField += ` AS ${selectField.alias}`;
                                return aliasSelectField;
                            }
                        })
                            .join(",");
                    }
                    else {
                        return `${joinTableName}.*`;
                    }
                })
                    .filter((_) => Boolean(_))
                    .join(",");
    }
    if (genObject?.fullTextSearch &&
        full_text_match_str &&
        full_text_search_str) {
        str += `, ${full_text_match_str} AS ${genObject.fullTextSearch.scoreAlias}`;
        sqlSearhValues.push(full_text_search_str);
    }
    str += ` FROM ${table_name}`;
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
                            ? `${join.tableName}` + " " + join.alias
                            : `${join.tableName}`) +
                        " ON " +
                        (() => {
                            if (Array.isArray(join.match)) {
                                return ("(" +
                                    join.match
                                        .map((mtch) => sqlGenGenJoinStr({
                                        mtch,
                                        join,
                                        table_name,
                                    }))
                                        .join(join.operator
                                        ? ` ${join.operator} `
                                        : " AND ") +
                                    ")");
                            }
                            else if (typeof join.match == "object") {
                                return sqlGenGenJoinStr({
                                    mtch: join.match,
                                    join,
                                    table_name,
                                });
                            }
                        })());
                })
                    .join(" ");
    }
    return { str, values: sqlSearhValues };
}

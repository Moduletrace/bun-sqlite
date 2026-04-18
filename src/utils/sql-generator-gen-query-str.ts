import { isUndefined } from "lodash";
import type { ServerQueryParam, TableSelectFieldsObject } from "../types";
import sqlGenGrabConcatStr from "./sql-generator-grab-concat-str";
import sqlGenGenJoinStr from "./sql-generator-gen-join-str";
import sqlGenGrabSelectFieldSQL from "./sql-generator-grab-select-field-sql";

type Param<T extends { [key: string]: any } = { [key: string]: any }> = {
    genObject?: ServerQueryParam<T>;
    selectFields?: (keyof T | TableSelectFieldsObject<T>)[];
    append_table_names?: boolean;
    table_name: string;
    full_text_match_str?: string;
    full_text_search_str?: string;
};

export default function sqlGenGenQueryStr<
    T extends { [key: string]: any } = { [key: string]: any },
>(params: Param<T>) {
    let str = "SELECT";

    const genObject = params.genObject;
    const table_name = params.table_name;
    const full_text_match_str = params.full_text_match_str;
    const full_text_search_str = params.full_text_search_str;

    let sqlSearhValues: any[] = [];

    if (genObject?.select_sql) {
        str += ` ${genObject.select_sql}`;
    } else if (genObject?.selectFields?.[0]) {
        if (genObject.join) {
            str += sqlGenGrabSelectFieldSQL<T>({
                selectFields: genObject.selectFields,
                append_table_names: true,
                table_name,
            });
        } else {
            str += sqlGenGrabSelectFieldSQL<T>({
                selectFields: genObject.selectFields,
                table_name,
            });
        }
    } else {
        if (genObject?.join) {
            str += ` ${table_name}.*`;
        } else {
            str += " *";
        }
    }

    if (genObject?.countSubQueries) {
        let countSqls: string[] = [];

        for (let i = 0; i < genObject.countSubQueries.length; i++) {
            const countSubQuery = genObject.countSubQueries[i];
            if (!countSubQuery) continue;

            const tableAlias = countSubQuery.table_alias;

            let subQStr = `(SELECT COUNT(*)`;

            subQStr += ` FROM ${countSubQuery.table}${
                tableAlias ? ` ${tableAlias}` : ""
            }`;

            subQStr += ` WHERE (`;

            for (let j = 0; j < countSubQuery.srcTrgMap.length; j++) {
                const csqSrc = countSubQuery.srcTrgMap[j];
                if (!csqSrc) continue;

                subQStr += ` ${tableAlias || countSubQuery.table}.${
                    csqSrc.src
                }`;

                if (typeof csqSrc.trg == "string") {
                    subQStr += ` = ?`;
                    sqlSearhValues.push(csqSrc.trg);
                } else if (typeof csqSrc.trg == "object") {
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
        const existingJoinTableNames: string[] = [table_name];

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
                    } else if (joinObj.selectFields) {
                        return joinObj.selectFields
                            .map((selectField) => {
                                if (typeof selectField == "string") {
                                    return `${joinTableName}.${selectField}`;
                                } else if (typeof selectField == "object") {
                                    let aliasSelectField = `${joinTableName}.${selectField.field}`;

                                    if (selectField.count) {
                                        aliasSelectField = `COUNT(${joinTableName}.${selectField.field})`;
                                    } else if (selectField.sum) {
                                        aliasSelectField = `SUM(${selectField.distinct ? "DISTINCT " : ""}${joinTableName}.${selectField.field})`;
                                    } else if (selectField.average) {
                                        aliasSelectField = `AVERAGE(${joinTableName}.${selectField.field})`;
                                    } else if (selectField.max) {
                                        aliasSelectField = `MAX(${joinTableName}.${selectField.field})`;
                                    } else if (selectField.min) {
                                        aliasSelectField = `MIN(${joinTableName}.${selectField.field})`;
                                    } else if (
                                        selectField.group_concat &&
                                        selectField.alias
                                    ) {
                                        return sqlGenGrabConcatStr({
                                            field: `${joinTableName}.${selectField.field}`,
                                            alias: selectField.alias,
                                            separator:
                                                selectField.group_concat
                                                    .separator,
                                            distinct:
                                                selectField.group_concat
                                                    .distinct,
                                        });
                                    } else if (selectField.distinct) {
                                        aliasSelectField = `DISTINCT ${joinTableName}.${selectField.field}`;
                                    }

                                    if (selectField.alias)
                                        aliasSelectField += ` AS ${selectField.alias}`;
                                    return aliasSelectField;
                                }
                            })
                            .join(",");
                    } else {
                        return `${joinTableName}.*`;
                    }
                })
                .filter((_) => Boolean(_))
                .join(",");
    }

    if (
        genObject?.fullTextSearch &&
        full_text_match_str &&
        full_text_search_str
    ) {
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
                    return (
                        join.joinType +
                        " " +
                        (join.alias
                            ? `${join.tableName}` + " " + join.alias
                            : `${join.tableName}`) +
                        " ON " +
                        (() => {
                            if (Array.isArray(join.match)) {
                                return (
                                    "(" +
                                    join.match
                                        .map((mtch) => {
                                            const { str, values } =
                                                sqlGenGenJoinStr({
                                                    mtch,
                                                    join,
                                                    table_name,
                                                });

                                            sqlSearhValues.push(...values);

                                            return str;
                                        })
                                        .join(
                                            join.operator
                                                ? ` ${join.operator} `
                                                : " AND ",
                                        ) +
                                    ")"
                                );
                            } else if (typeof join.match == "object") {
                                const { str, values } = sqlGenGenJoinStr({
                                    mtch: join.match,
                                    join,
                                    table_name,
                                });

                                sqlSearhValues.push(...values);

                                return str;
                            }
                        })()
                    );
                })
                .join(" ");
    }

    return { str, values: sqlSearhValues };
}

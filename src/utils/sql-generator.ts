import type {
    ServerQueryParam,
    ServerQueryParamOrder,
    SQLInsertGenValueType,
} from "../types";
import sqlGenGenSearchStr from "./sql-generator-gen-search-str";
import sqlGenGenQueryStr from "./sql-generator-gen-query-str";

type Param<T extends { [key: string]: any } = { [key: string]: any }> = {
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
export default function sqlGenerator<
    T extends { [key: string]: any } = { [key: string]: any },
>({ tableName, genObject, dbFullName, count }: Param<T>): Return {
    const finalQuery = genObject?.query ? genObject.query : undefined;

    const queryKeys = finalQuery ? Object.keys(finalQuery) : undefined;

    const sqlSearhValues: SQLInsertGenValueType[] = [];

    let fullTextMatchStr = genObject?.fullTextSearch
        ? ` MATCH(${genObject.fullTextSearch.fields
              .map((f) =>
                  genObject.join ? `${tableName}.${String(f)}` : `${String(f)}`,
              )
              .join(",")}) AGAINST (? IN BOOLEAN MODE)`
        : undefined;

    const fullTextSearchStr = genObject?.fullTextSearch
        ? genObject.fullTextSearch.searchTerm
              .split(` `)
              .map((t) => `${t}`)
              .join(" ")
        : undefined;

    let { str: queryString, values } = sqlGenGenQueryStr<T>({
        table_name: tableName,
        append_table_names: true,
        full_text_match_str: fullTextMatchStr,
        full_text_search_str: fullTextSearchStr,
        genObject,
    });

    sqlSearhValues.push(...values);

    const sqlSearhString = queryKeys?.map((field) => {
        const queryObj = finalQuery?.[field];
        if (!queryObj) return;

        if (queryObj.__query) {
            const subQueryGroup = queryObj.__query;

            const subSearchKeys = Object.keys(subQueryGroup);
            const subSearchString = subSearchKeys.map((_field) => {
                const newSubQueryObj = subQueryGroup?.[_field];

                if (newSubQueryObj) {
                    const { str, values } = sqlGenGenSearchStr({
                        queryObj: newSubQueryObj,
                        field: newSubQueryObj.fieldName || _field,
                        join: genObject?.join,
                        table_name: tableName,
                    });

                    sqlSearhValues.push(...values);

                    return str;
                }
            });

            return (
                "(" +
                subSearchString.join(` ${queryObj.operator || "AND"} `) +
                ")"
            );
        }

        const { str, values } = sqlGenGenSearchStr({
            queryObj,
            field: queryObj.fieldName || field,
            join: genObject?.join,
            table_name: tableName,
        });

        sqlSearhValues.push(...values);

        return str;
    });

    const cleanedUpSearchStr = sqlSearhString?.filter(
        (str) => typeof str == "string",
    );

    const isSearchStr =
        cleanedUpSearchStr?.[0] && cleanedUpSearchStr.find((str) => str);

    if (isSearchStr) {
        const stringOperator = genObject?.searchOperator || "AND";
        queryString += ` WHERE ${cleanedUpSearchStr.join(
            ` ${stringOperator} `,
        )}`;
    }

    if (genObject?.fullTextSearch && fullTextSearchStr && fullTextMatchStr) {
        queryString += `${isSearchStr ? " AND" : " WHERE"} ${fullTextMatchStr}`;
        sqlSearhValues.push(fullTextSearchStr);
    }

    if (genObject?.group) {
        let group_by_txt = ``;

        if (typeof genObject.group == "string") {
            group_by_txt = genObject.group;
        } else if (Array.isArray(genObject.group)) {
            for (let i = 0; i < genObject.group.length; i++) {
                const group = genObject.group[i];

                if (typeof group == "string") {
                    group_by_txt += `\`${group.toString()}\``;
                } else if (typeof group == "object" && group.table) {
                    group_by_txt += `${group.table}.${String(group.field)}`;
                } else if (typeof group == "object") {
                    group_by_txt += `${String(group.field)}`;
                }

                if (i < genObject.group.length - 1) {
                    group_by_txt += ",";
                }
            }
        } else if (typeof genObject.group == "object") {
            if (genObject.group.table) {
                group_by_txt = `${genObject.group.table}.${String(genObject.group.field)}`;
            } else {
                group_by_txt = `${String(genObject.group.field)}`;
            }
        }

        queryString += ` GROUP BY ${group_by_txt}`;
    }

    function grabOrderString(order: ServerQueryParamOrder<T>) {
        let orderFields = [];
        let orderSrt = ``;

        if (genObject?.fullTextSearch && genObject.fullTextSearch.scoreAlias) {
            orderFields.push(genObject.fullTextSearch.scoreAlias);
        } else if (genObject?.join) {
            orderFields.push(`${tableName}.${String(order.field)}`);
        } else {
            orderFields.push(order.field);
        }

        orderSrt += ` ${orderFields.join(", ")} ${order.strategy}`;

        return orderSrt;
    }

    if (genObject?.order) {
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
        } else {
            orderSrt += grabOrderString(genObject.order);
        }

        queryString += ` ${orderSrt}`;
    }

    if (genObject?.limit && !count) queryString += ` LIMIT ${genObject.limit}`;

    if (genObject?.offset) {
        queryString += ` OFFSET ${genObject.offset}`;
    } else if (genObject?.page && genObject.limit && !count) {
        queryString += ` OFFSET ${(genObject.page - 1) * genObject.limit}`;
    }

    return {
        string: queryString,
        values: sqlSearhValues,
    };
}

// let queryString = (() => {
//     let str = "SELECT";

//     if (genObject?.select_sql) {
//         str += ` ${genObject.select_sql}`;
//     } else if (genObject?.selectFields?.[0]) {
//         if (genObject.join) {
//             str += sqlGenGrabSelectFieldSQL<T>({
//                 selectFields: genObject.selectFields,
//                 append_table_names: true,
//                 table_name: tableName,
//             });
//         } else {
//             str += sqlGenGrabSelectFieldSQL({
//                 selectFields: genObject.selectFields,
//                 table_name: tableName,
//             });
//         }
//     } else {
//         if (genObject?.join) {
//             str += ` ${tableName}.*`;
//         } else {
//             str += " *";
//         }
//     }

//     if (genObject?.countSubQueries) {
//         let countSqls: string[] = [];

//         for (let i = 0; i < genObject.countSubQueries.length; i++) {
//             const countSubQuery = genObject.countSubQueries[i];
//             if (!countSubQuery) continue;

//             const tableAlias = countSubQuery.table_alias;

//             let subQStr = `(SELECT COUNT(*)`;

//             subQStr += ` FROM ${countSubQuery.table}${
//                 tableAlias ? ` ${tableAlias}` : ""
//             }`;

//             subQStr += ` WHERE (`;

//             for (let j = 0; j < countSubQuery.srcTrgMap.length; j++) {
//                 const csqSrc = countSubQuery.srcTrgMap[j];
//                 if (!csqSrc) continue;

//                 subQStr += ` ${tableAlias || countSubQuery.table}.${
//                     csqSrc.src
//                 }`;

//                 if (typeof csqSrc.trg == "string") {
//                     subQStr += ` = ?`;
//                     sqlSearhValues.push(csqSrc.trg);
//                 } else if (typeof csqSrc.trg == "object") {
//                     subQStr += ` = ${csqSrc.trg.table}.${csqSrc.trg.field}`;
//                 }

//                 if (j < countSubQuery.srcTrgMap.length - 1) {
//                     subQStr += ` AND `;
//                 }
//             }

//             subQStr += ` )) AS ${countSubQuery.alias}`;
//             countSqls.push(subQStr);
//         }

//         str += `, ${countSqls.join(",")}`;
//     }

//     if (genObject?.join) {
//         const existingJoinTableNames: string[] = [tableName];

//         str +=
//             "," +
//             genObject.join
//                 .flat()
//                 .filter((j) => !isUndefined(j))
//                 .map((joinObj) => {
//                     const joinTableName = joinObj.alias
//                         ? joinObj.alias
//                         : joinObj.tableName;

//                     if (existingJoinTableNames.includes(joinTableName))
//                         return null;
//                     existingJoinTableNames.push(joinTableName);

//                     if (joinObj.group_concat) {
//                         return sqlGenGrabConcatStr({
//                             field: `${joinTableName}.${joinObj.group_concat.field}`,
//                             alias: joinObj.group_concat.alias,
//                             separator: joinObj.group_concat.separator,
//                         });
//                     } else if (joinObj.selectFields) {
//                         return joinObj.selectFields
//                             .map((selectField) => {
//                                 if (typeof selectField == "string") {
//                                     return `${joinTableName}.${selectField}`;
//                                 } else if (typeof selectField == "object") {
//                                     let aliasSelectField = selectField.count
//                                         ? `COUNT(${joinTableName}.${selectField.field})`
//                                         : `${joinTableName}.${selectField.field}`;
//                                     if (selectField.alias)
//                                         aliasSelectField += ` AS ${selectField.alias}`;
//                                     return aliasSelectField;
//                                 }
//                             })
//                             .join(",");
//                     } else {
//                         return `${joinTableName}.*`;
//                     }
//                 })
//                 .filter((_) => Boolean(_))
//                 .join(",");
//     }

//     if (
//         genObject?.fullTextSearch &&
//         fullTextMatchStr &&
//         fullTextSearchStr
//     ) {
//         str += `, ${fullTextMatchStr} AS ${genObject.fullTextSearch.scoreAlias}`;
//         sqlSearhValues.push(fullTextSearchStr);
//     }

//     str += ` FROM ${tableName}`;

//     if (genObject?.join) {
//         str +=
//             " " +
//             genObject.join
//                 .flat()
//                 .filter((j) => !isUndefined(j))
//                 .map((join) => {
//                     return (
//                         join.joinType +
//                         " " +
//                         (join.alias
//                             ? `${join.tableName}` + " " + join.alias
//                             : `${join.tableName}`) +
//                         " ON " +
//                         (() => {
//                             if (Array.isArray(join.match)) {
//                                 return (
//                                     "(" +
//                                     join.match
//                                         .map((mtch) =>
//                                             sqlGenGenJoinStr({
//                                                 mtch,
//                                                 join,
//                                                 table_name: tableName,
//                                             }),
//                                         )
//                                         .join(
//                                             join.operator
//                                                 ? ` ${join.operator} `
//                                                 : " AND ",
//                                         ) +
//                                     ")"
//                                 );
//                             } else if (typeof join.match == "object") {
//                                 return sqlGenGenJoinStr({
//                                     mtch: join.match,
//                                     join,
//                                     table_name: tableName,
//                                 });
//                             }
//                         })()
//                     );
//                 })
//                 .join(" ");
//     }

//     return str;
// })();

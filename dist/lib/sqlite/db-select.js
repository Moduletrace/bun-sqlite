import mysql from "mysql";
import DbClient from ".";
import _ from "lodash";
import sqlGenerator from "../../utils/sql-generator";
export default async function DbSelect({ table, query, count, targetId, }) {
    let sqlObj = null;
    try {
        let finalQuery = query || {};
        if (targetId) {
            finalQuery = _.merge(finalQuery, {
                query: {
                    id: {
                        value: String(targetId),
                    },
                },
            });
        }
        sqlObj = sqlGenerator({
            tableName: table,
            genObject: finalQuery,
        });
        let sql = mysql.format(sqlObj.string, sqlObj.values);
        const res = DbClient.query(sql);
        const batchRes = res.all();
        let resp = {
            success: Boolean(batchRes[0]),
            payload: batchRes,
            singleRes: batchRes[0],
            debug: {
                sqlObj,
                sql,
            },
        };
        if (count) {
            let count_sql_object = sqlGenerator({
                tableName: table,
                genObject: finalQuery,
                count,
            });
            let count_sql = mysql.format(count_sql_object.string, count_sql_object.values);
            count_sql = `SELECT COUNT(*) FROM (${count_sql}) as c`;
            const count_res = DbClient.query(count_sql).all();
            const count_val = count_res[0]?.["COUNT(*)"];
            resp["count"] = Number(count_val);
            resp["debug"]["count_sql"] = count_sql;
        }
        return resp;
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            debug: {
                sqlObj,
            },
        };
    }
}

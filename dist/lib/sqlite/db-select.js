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
            count,
        });
        const sql = mysql.format(sqlObj.string, sqlObj.values);
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
            const count_val = count ? batchRes[0]?.["COUNT(*)"] : undefined;
            resp["count"] = Number(count_val);
            delete resp.payload;
            delete resp.singleRes;
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

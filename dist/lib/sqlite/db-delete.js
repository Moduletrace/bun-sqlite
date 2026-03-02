import DbClient from ".";
import _ from "lodash";
import sqlGenerator from "../../utils/sql-generator";
export default async function DbDelete({ table, query, targetId, }) {
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
        const sqlQueryObj = sqlGenerator({
            tableName: table,
            genObject: finalQuery,
        });
        const whereClause = sqlQueryObj.string.match(/WHERE .*/)?.[0];
        if (whereClause) {
            let sql = `DELETE FROM ${table} ${whereClause}`;
            const res = DbClient.run(sql, sqlQueryObj.values);
            return {
                success: Boolean(res.changes),
                postInsertReturn: {
                    affectedRows: res.changes,
                    insertId: Number(res.lastInsertRowid),
                },
                debug: {
                    sql,
                    values: sqlQueryObj.values,
                },
            };
        }
        else {
            return {
                success: false,
                msg: `No WHERE clause`,
            };
        }
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

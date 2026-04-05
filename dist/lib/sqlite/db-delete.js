import DbClient from ".";
import _ from "lodash";
import sqlGenerator from "../../utils/sql-generator";
export default async function DbDelete({ table, query, targetId, }) {
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
        const whereClause = sqlObj.string.match(/WHERE .*/)?.[0];
        if (whereClause) {
            let sql = `DELETE FROM ${table} ${whereClause}`;
            const res = DbClient.run(sql, sqlObj.values);
            return {
                success: Boolean(res.changes),
                postInsertReturn: {
                    affectedRows: res.changes,
                    insertId: Number(res.lastInsertRowid),
                },
                debug: {
                    sqlObj,
                },
            };
        }
        else {
            return {
                success: false,
                msg: `No WHERE clause`,
                debug: {
                    sqlObj,
                },
            };
        }
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

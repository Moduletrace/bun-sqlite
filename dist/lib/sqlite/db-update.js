import DbClient from ".";
import _ from "lodash";
import sqlGenerator from "../../utils/sql-generator";
export default async function DbUpdate({ table, data, query, targetId, }) {
    let sqlObj = { string: "", values: [] };
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
        let values = [];
        const whereClause = sqlQueryObj.string.match(/WHERE .*/)?.[0];
        if (whereClause) {
            let sql = `UPDATE ${table} SET`;
            const finalData = {
                updated_at: Date.now(),
                ...data,
            };
            const keys = Object.keys(finalData);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!key)
                    continue;
                const isLast = i == keys.length - 1;
                sql += ` ${key}=?`;
                const value = finalData[key];
                values.push(value || null);
                if (!isLast) {
                    sql += `,`;
                }
            }
            sql += ` ${whereClause}`;
            values = [...values, ...sqlQueryObj.values];
            sqlObj.string = sql;
            sqlObj.values = values;
            const res = DbClient.run(sql, values);
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

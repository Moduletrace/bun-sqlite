import DbClient from ".";
import _ from "lodash";
export default async function DbSQL({ sql, values }) {
    try {
        const trimmed_sql = sql.trim();
        const res = trimmed_sql.match(/^select/i)
            ? DbClient.query(trimmed_sql).all(...(values || []))
            : DbClient.run(trimmed_sql, values || []);
        return {
            success: true,
            payload: Array.isArray(res) ? res : undefined,
            singleRes: Array.isArray(res) ? res?.[0] : undefined,
            postInsertReturn: Array.isArray(res)
                ? undefined
                : {
                    affectedRows: res.changes,
                    insertId: Number(res.lastInsertRowid),
                },
            debug: {
                sqlObj: {
                    sql: trimmed_sql,
                    values,
                },
                sql,
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

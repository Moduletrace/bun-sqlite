import DbClient from ".";
import _ from "lodash";
export default async function DbSQL({ sql, values }) {
    try {
        const res = sql.match(/^select/i)
            ? DbClient.query(sql).all(...(values || []))
            : DbClient.run(sql, values || []);
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
                    sql,
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

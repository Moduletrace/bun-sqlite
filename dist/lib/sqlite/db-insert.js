import DbClient from ".";
import sqlInsertGenerator from "../../utils/sql-insert-generator";
import grabDuplicateSafeInsertSql from "../grab-duplicate-safe-insert-sql";
export default async function DbInsert({ table, data, update_on_duplicate, }) {
    let sqlObj = null;
    try {
        const finalData = data.map((d) => ({
            ...d,
            created_at: Date.now(),
            updated_at: Date.now(),
        }));
        sqlObj =
            sqlInsertGenerator({
                tableName: table,
                data: finalData,
            }) || null;
        let sql = sqlObj?.query || "";
        if (update_on_duplicate && data[0]) {
            sql = await grabDuplicateSafeInsertSql({ data, table, sql });
        }
        (sqlObj || {}).query = sql;
        const res = DbClient.run(sql, sqlObj?.values || []);
        return {
            success: Boolean(Number(res.lastInsertRowid)),
            postInsertReturn: {
                affectedRows: res.changes,
                insertId: Number(res.lastInsertRowid),
            },
            debug: {
                sqlObj,
            },
        };
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

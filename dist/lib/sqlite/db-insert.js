import DbClient from ".";
import sqlInsertGenerator from "../../utils/sql-insert-generator";
export default async function DbInsert({ table, data }) {
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
        const res = DbClient.run(sqlObj?.query || "", sqlObj?.values || []);
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

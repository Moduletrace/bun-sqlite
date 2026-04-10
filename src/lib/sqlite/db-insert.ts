import DbClient from ".";
import type { APIResponseObject, SQLInsertGenReturn } from "../../types";
import sqlInsertGenerator from "../../utils/sql-insert-generator";
import grabDuplicateSafeInsertSql from "../grab-duplicate-safe-insert-sql";

type Params<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
> = {
    table: Table;
    data: Schema[];
    update_on_duplicate?: boolean;
};

export default async function DbInsert<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
>({
    table,
    data,
    update_on_duplicate,
}: Params<Schema, Table>): Promise<APIResponseObject> {
    let sqlObj: SQLInsertGenReturn | null = null;

    try {
        const finalData: { [k: string]: any }[] = data.map((d) => ({
            ...d,
            created_at: Date.now(),
            updated_at: Date.now(),
        }));

        sqlObj =
            sqlInsertGenerator({
                tableName: table,
                data: finalData as any[],
            }) || null;

        let sql = sqlObj?.query || "";

        if (update_on_duplicate && data[0]) {
            sql = await grabDuplicateSafeInsertSql({ data, table, sql });
        }

        (sqlObj || ({} as any)).query = sql;

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
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            debug: {
                sqlObj,
            },
        };
    }
}

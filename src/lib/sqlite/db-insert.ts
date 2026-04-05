import DbClient from ".";
import type { APIResponseObject, SQLInsertGenReturn } from "../../types";
import sqlInsertGenerator from "../../utils/sql-insert-generator";

type Params<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
> = {
    table: Table;
    data: Schema[];
};

export default async function DbInsert<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
>({ table, data }: Params<Schema, Table>): Promise<APIResponseObject> {
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

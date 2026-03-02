import DbClient from ".";
import type { APIResponseObject } from "../../types";
import sqlInsertGenerator from "../../utils/sql-insert-generator";

type Params<T extends { [k: string]: any } = { [k: string]: any }> = {
    table: string;
    data: T[];
};

export default async function DbInsert<
    T extends { [k: string]: any } = { [k: string]: any },
>({ table, data }: Params<T>): Promise<APIResponseObject> {
    try {
        const finalData: { [k: string]: any }[] = data.map((d) => ({
            ...d,
            created_at: Date.now(),
            updated_at: Date.now(),
        }));

        const sqlObj = sqlInsertGenerator({
            tableName: table,
            data: finalData as any[],
        });

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
        };
    }
}

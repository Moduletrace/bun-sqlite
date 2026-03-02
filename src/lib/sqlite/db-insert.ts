import type { DSQL_TRAVIS_AI_ALL_TYPEDEFS, DsqlTables } from "@/types/db";
import datasquirel from "@moduletrace/datasquirel";
import type { APIResponseObject } from "@moduletrace/datasquirel/dist/package-shared/types";
import DbClient from ".";
import type { DBChanges } from "@/types/general";

type Params<T extends { [k: string]: any } = DSQL_TRAVIS_AI_ALL_TYPEDEFS> = {
    table: (typeof DsqlTables)[number];
    data: T[];
};

export default async function DbInsert<
    T extends { [k: string]: any } = DSQL_TRAVIS_AI_ALL_TYPEDEFS,
>({ table, data }: Params<T>): Promise<APIResponseObject<DBChanges>> {
    try {
        const finalData: DSQL_TRAVIS_AI_ALL_TYPEDEFS[] = data.map((d) => ({
            ...d,
            created_at: Date.now(),
            updated_at: Date.now(),
        }));

        const sqlObj = datasquirel.sql.sqlInsertGenerator({
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

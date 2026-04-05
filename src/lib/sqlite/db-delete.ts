import DbClient from ".";
import _ from "lodash";
import type { APIResponseObject, ServerQueryParam } from "../../types";
import sqlGenerator from "../../utils/sql-generator";

type Params<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
> = {
    table: Table;
    query?: ServerQueryParam<Schema>;
    targetId?: number | string;
};

export default async function DbDelete<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
>({
    table,
    query,
    targetId,
}: Params<Schema, Table>): Promise<APIResponseObject> {
    let sqlObj: ReturnType<typeof sqlGenerator> | null = null;

    try {
        let finalQuery = query || {};

        if (targetId) {
            finalQuery = _.merge<ServerQueryParam<any>, ServerQueryParam<any>>(
                finalQuery,
                {
                    query: {
                        id: {
                            value: String(targetId),
                        },
                    },
                },
            );
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
        } else {
            return {
                success: false,
                msg: `No WHERE clause`,
                debug: {
                    sqlObj,
                },
            };
        }
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

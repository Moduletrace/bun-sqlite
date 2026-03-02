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

        const sqlQueryObj = sqlGenerator({
            tableName: table,
            genObject: finalQuery,
        });

        const whereClause = sqlQueryObj.string.match(/WHERE .*/)?.[0];

        if (whereClause) {
            let sql = `DELETE FROM ${table} ${whereClause}`;

            const res = DbClient.run(sql, sqlQueryObj.values);

            return {
                success: Boolean(res.changes),
                postInsertReturn: {
                    affectedRows: res.changes,
                    insertId: Number(res.lastInsertRowid),
                },
                debug: {
                    sql,
                    values: sqlQueryObj.values,
                },
            };
        } else {
            return {
                success: false,
                msg: `No WHERE clause`,
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
}

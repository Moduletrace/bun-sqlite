import mysql from "mysql";
import DbClient from ".";
import _ from "lodash";
import type { APIResponseObject, ServerQueryParam } from "../../types";
import sqlGenerator from "../../utils/sql-generator";

type Params<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
> = {
    query?: ServerQueryParam<Schema>;
    table: Table;
    count?: boolean;
    targetId?: number | string;
};

export default async function DbSelect<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
>({
    table,
    query,
    count,
    targetId,
}: Params<Schema, Table>): Promise<APIResponseObject<Schema>> {
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

        let sql = mysql.format(sqlObj.string, sqlObj.values);

        const res = DbClient.query<Schema, Schema[]>(sql);
        const batchRes = res.all();

        let resp: APIResponseObject<Schema> = {
            success: Boolean(batchRes[0]),
            payload: batchRes,
            singleRes: batchRes[0],
            debug: {
                sqlObj,
                sql,
            },
        };

        if (count) {
            let count_sql_object = sqlGenerator({
                tableName: table,
                genObject: finalQuery,
                count,
            });

            let count_sql = mysql.format(
                count_sql_object.string,
                count_sql_object.values,
            );

            count_sql = `SELECT COUNT(*) FROM (${count_sql}) as c`;

            const count_res = DbClient.query<Schema, Schema[]>(count_sql).all();

            const count_val = count_res[0]?.["COUNT(*)"];
            resp["count"] = Number(count_val);
            resp["debug"]["count_sql"] = count_sql;
        }

        return resp;
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

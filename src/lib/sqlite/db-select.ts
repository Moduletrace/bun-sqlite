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
            count,
        });

        const sql = mysql.format(sqlObj.string, sqlObj.values);

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
            const count_val = count ? batchRes[0]?.["COUNT(*)"] : undefined;
            resp["count"] = Number(count_val);

            delete resp.payload;
            delete resp.singleRes;
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

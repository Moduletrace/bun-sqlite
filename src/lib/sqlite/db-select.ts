import mysql from "mysql";
import DbClient from ".";
import _ from "lodash";
import type { APIResponseObject, ServerQueryParam } from "../../types";
import sqlGenerator from "../../utils/sql-generator";

type Params<T extends { [k: string]: any } = { [k: string]: any }> = {
    query?: ServerQueryParam<T>;
    table: string;
    count?: boolean;
    targetId?: number | string;
};

export default async function DbSelect<
    T extends { [k: string]: any } = { [k: string]: any },
>({ table, query, count, targetId }: Params<T>): Promise<APIResponseObject<T>> {
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

        const sqlObj = sqlGenerator({
            tableName: table,
            genObject: finalQuery,
            count,
        });

        const sql = mysql.format(sqlObj.string, sqlObj.values);

        const res = DbClient.query<T, T[]>(sql);
        const batchRes = res.all();

        let resp: APIResponseObject<T> = {
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
        };
    }
}

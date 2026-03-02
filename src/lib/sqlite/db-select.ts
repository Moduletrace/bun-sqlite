import mysql from "mysql";
import type { DSQL_TRAVIS_AI_ALL_TYPEDEFS, DsqlTables } from "@/types/db";
import datasquirel from "@moduletrace/datasquirel";
import type {
    APIResponseObject,
    ServerQueryParam,
} from "@moduletrace/datasquirel/dist/package-shared/types";
import DbClient from ".";
import _ from "lodash";

type Params<
    T extends DSQL_TRAVIS_AI_ALL_TYPEDEFS = DSQL_TRAVIS_AI_ALL_TYPEDEFS,
> = {
    query?: ServerQueryParam<T>;
    table: (typeof DsqlTables)[number];
    count?: boolean;
    targetId?: number | string;
};

export default async function DbSelect<
    T extends DSQL_TRAVIS_AI_ALL_TYPEDEFS = DSQL_TRAVIS_AI_ALL_TYPEDEFS,
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

        const sqlObj = datasquirel.sql.sqlGenerator({
            tableName: table,
            genObject: finalQuery,
            count,
        });

        const sql = mysql.format(sqlObj.string, sqlObj.values);

        const res = DbClient.query<T, T[]>(sql);
        const batchRes = res.all();

        return {
            success: true,
            payload: batchRes,
            singleRes: batchRes[0],
            debug: {
                sqlObj,
                sql,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
}

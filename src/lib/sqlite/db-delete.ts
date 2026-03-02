import type { DSQL_TRAVIS_AI_ALL_TYPEDEFS, DsqlTables } from "@/types/db";
import datasquirel from "@moduletrace/datasquirel";
import type {
    APIResponseObject,
    ServerQueryParam,
} from "@moduletrace/datasquirel/dist/package-shared/types";
import DbClient from ".";
import _ from "lodash";

type Params<T extends { [k: string]: any } = DSQL_TRAVIS_AI_ALL_TYPEDEFS> = {
    table: (typeof DsqlTables)[number];
    query?: ServerQueryParam<T>;
    targetId?: number | string;
};

export default async function DbDelete<
    T extends { [k: string]: any } = DSQL_TRAVIS_AI_ALL_TYPEDEFS,
>({ table, query, targetId }: Params<T>): Promise<APIResponseObject> {
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

        const sqlQueryObj = datasquirel.sql.sqlGenerator({
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

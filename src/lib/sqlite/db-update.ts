import DbClient from ".";
import _ from "lodash";
import type {
    APIResponseObject,
    SQLInsertGenValueType,
    ServerQueryParam,
} from "../../types";
import sqlGenerator from "../../utils/sql-generator";

type Params<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
> = {
    table: Table;
    data: Schema;
    query?: ServerQueryParam<Schema>;
    targetId?: number | string;
};

export default async function DbUpdate<
    Schema extends { [k: string]: any } = { [k: string]: any },
    Table extends string = string,
>({
    table,
    data,
    query,
    targetId,
}: Params<Schema, Table>): Promise<APIResponseObject> {
    let sqlObj: ReturnType<typeof sqlGenerator> = { string: "", values: [] };

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

        let values: SQLInsertGenValueType[] = [];

        const whereClause = sqlQueryObj.string.match(/WHERE .*/)?.[0];

        if (whereClause) {
            let sql = `UPDATE ${table} SET`;

            const finalData: { [k: string]: SQLInsertGenValueType } = {
                ...data,
                updated_at: Date.now(),
            };

            const keys = Object.keys(finalData);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!key) continue;

                const isLast = i == keys.length - 1;

                sql += ` ${key}=?`;
                const value = finalData[key];
                values.push(value || null);

                if (!isLast) {
                    sql += `,`;
                }
            }

            sql += ` ${whereClause}`;
            values = [...values, ...sqlQueryObj.values];

            sqlObj.string = sql;
            sqlObj.values = values as any[];

            const res = DbClient.run(sql, values);

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

import DbClient from ".";
import _ from "lodash";
import type { APIResponseObject, ServerQueryParam } from "../../types";
import sqlGenerator from "../../utils/sql-generator";

type Params<T extends { [k: string]: any } = { [k: string]: any }> = {
    table: string;
    data: T;
    query?: ServerQueryParam<T>;
    targetId?: number | string;
};

export default async function DbUpdate<
    T extends { [k: string]: any } = { [k: string]: any },
>({ table, data, query, targetId }: Params<T>): Promise<APIResponseObject> {
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

        let values: (string | number)[] = [];

        const whereClause = sqlQueryObj.string.match(/WHERE .*/)?.[0];

        if (whereClause) {
            let sql = `UPDATE ${table} SET`;

            const finalData: { [k: string]: any } = {
                ...data,
                updated_at: Date.now(),
            };

            const keys = Object.keys(finalData);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (!key) continue;

                const isLast = i == keys.length - 1;

                sql += ` ${key}=?`;
                values.push(
                    String(finalData[key as keyof { [k: string]: any }]),
                );

                if (!isLast) {
                    sql += `,`;
                }
            }

            sql += ` ${whereClause}`;
            values = [...values, ...sqlQueryObj.values];

            const res = DbClient.run(sql, values);

            return {
                success: Boolean(res.changes),
                postInsertReturn: {
                    affectedRows: res.changes,
                    insertId: Number(res.lastInsertRowid),
                },
                debug: {
                    sql,
                    values,
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

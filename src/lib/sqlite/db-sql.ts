import DbClient from ".";
import _ from "lodash";
import type { APIResponseObject } from "../../types";

type Params = {
    sql: string;
    values?: (string | number)[];
};

export default async function DbSQL<
    T extends { [k: string]: any } = { [k: string]: any },
>({ sql, values }: Params): Promise<APIResponseObject<T>> {
    try {
        const res = sql.match(/^select/i)
            ? DbClient.query(sql).all(...(values || []))
            : DbClient.run(sql, values || []);

        return {
            success: true,
            payload: Array.isArray(res) ? (res as T[]) : undefined,
            singleRes: Array.isArray(res) ? (res as T[])?.[0] : undefined,
            postInsertReturn: Array.isArray(res)
                ? undefined
                : {
                      affectedRows: res.changes,
                      insertId: Number(res.lastInsertRowid),
                  },
            debug: {
                sqlObj: {
                    sql,
                    values,
                },
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

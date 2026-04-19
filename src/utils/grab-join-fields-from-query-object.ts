import _ from "lodash";
import type {
    BunSQLiteQueryFieldValues,
    ServerQueryParam,
    ServerQueryParamsJoin,
} from "../types";

type Params<Q extends Record<string, any> = Record<string, any>> = {
    query: ServerQueryParam<Q>;
    ignore_select_fields?: boolean;
};

export default function grabJoinFieldsFromQueryObject<
    Q extends Record<string, any> = Record<string, any>,
    F extends string = string,
    T extends string = string,
>({
    query,
    ignore_select_fields,
}: Params<Q>): BunSQLiteQueryFieldValues<F, T>[] {
    const fields_values: BunSQLiteQueryFieldValues<F, T>[] = [];
    const new_query = _.cloneDeep(query);

    if (new_query.join) {
        for (let i = 0; i < new_query.join.length; i++) {
            const join = new_query.join[i];

            if (!join) continue;

            if (Array.isArray(join)) {
                for (let i = 0; i < join.length; i++) {
                    const single_join = join[i];
                    fields_values.push(
                        ...(grabSingleJoinData({
                            join: single_join as ServerQueryParamsJoin,
                            ignore_select_fields,
                        }) as BunSQLiteQueryFieldValues<F, T>[]),
                    );
                }
            } else {
                fields_values.push(
                    ...(grabSingleJoinData({
                        join: join as ServerQueryParamsJoin,
                        ignore_select_fields,
                    }) as BunSQLiteQueryFieldValues<F, T>[]),
                );
            }
        }
    }

    return fields_values;
}

function grabSingleJoinData({
    join,
    ignore_select_fields,
}: {
    join: ServerQueryParamsJoin;
    ignore_select_fields?: boolean;
}): BunSQLiteQueryFieldValues[] {
    let values: BunSQLiteQueryFieldValues[] = [];

    const join_select_fields = join?.selectFields;

    if (!join_select_fields?.[0] && !ignore_select_fields) {
        throw new Error(
            `\`selectFields\` required in joins. To ignore this error, pass the \`ignore_select_fields\` parameter`,
        );
    }

    if (join_select_fields?.[0]) {
        for (let i = 0; i < join_select_fields.length; i++) {
            const select_field = join_select_fields[i];
            if (select_field) {
                values.push({
                    table: join.tableName,
                    field:
                        typeof select_field == "object"
                            ? String(select_field.field)
                            : String(select_field),
                });
            }
        }
    }

    if (join.group_concat) {
        values.push({
            table: join.tableName,
            field: join.group_concat.field,
        });
    }

    return values;
}

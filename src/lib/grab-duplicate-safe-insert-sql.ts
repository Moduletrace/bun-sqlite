import init from "../functions/init";

type Params = {
    sql: string;
    table: string;
    data: any[];
};

export default async function ({ sql: passed_sql, table, data }: Params) {
    let sql = passed_sql;
    const { dbSchema } = await init();
    const table_schema = dbSchema.tables.find((t) => t.tableName == table);
    const now = Date.now();

    if (table_schema?.tableName) {
        const set_sql_arr = Object.keys(data[0]).map(
            (field) => `${field} = excluded.${field}`,
        );

        set_sql_arr.push(`updated_at = ${now}`);

        const set_sql = set_sql_arr.join(", ");

        const unique_fields = table_schema.fields.filter((f) => f.unique);

        for (let i = 0; i < unique_fields.length; i++) {
            const field = unique_fields[i];
            sql += ` ON CONFLICT(${field?.fieldName}) DO UPDATE SET ${set_sql}`;
        }

        if (table_schema.uniqueConstraints?.[0]) {
            for (let i = 0; i < table_schema.uniqueConstraints.length; i++) {
                const constraint = table_schema.uniqueConstraints[i];
                sql += ` ON CONFLICT(${constraint?.constraintTableFields?.map((c) => c.value)?.join(", ")}) DO UPDATE SET ${set_sql}`;
            }
        }
    }

    return sql;
}

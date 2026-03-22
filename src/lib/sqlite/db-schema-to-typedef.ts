import _ from "lodash";
import type {
    BUN_SQLITE_DatabaseSchemaType,
    BunSQLiteConfig,
} from "../../types";
import generateTypeDefinition from "./db-generate-type-defs";

type Params = {
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
    config: BunSQLiteConfig;
};

export default function dbSchemaToType({
    config,
    dbSchema,
}: Params): string[] | undefined {
    let datasquirelSchema = dbSchema;

    if (!datasquirelSchema) return;

    let tableNames = `export const BunSQLiteTables = [\n${datasquirelSchema.tables
        .map((tbl) => `    "${tbl.tableName}",`)
        .join("\n")}\n] as const`;

    const dbTablesSchemas = datasquirelSchema.tables;

    const defDbName = config.db_name
        ?.toUpperCase()
        .replace(/^[a-zA-Z0-9]/g, "_");

    const defNames: string[] = [];

    const schemas = dbTablesSchemas
        .map((table) => {
            let final_table = _.cloneDeep(table);

            if (final_table.parentTableName) {
                const parent_table = dbTablesSchemas.find(
                    (t) => t.tableName === final_table.parentTableName,
                );

                if (parent_table) {
                    final_table = _.merge(parent_table, {
                        tableName: final_table.tableName,
                        tableDescription: final_table.tableDescription,
                    });
                }
            }

            const defObj = generateTypeDefinition({
                paradigm: "TypeScript",
                table: final_table,
                typeDefName: `BUN_SQLITE_${defDbName}_${final_table.tableName.toUpperCase()}`,
                allValuesOptional: true,
                addExport: true,
            });

            if (defObj.tdName?.match(/./)) {
                defNames.push(defObj.tdName);
            }

            return defObj.typeDefinition;
        })
        .filter((schm) => typeof schm == "string");

    const allTd = defNames?.[0]
        ? `export type BUN_SQLITE_${defDbName}_ALL_TYPEDEFS = ${defNames.join(` & `)}`
        : ``;

    return [tableNames, ...schemas, allTd];
}

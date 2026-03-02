import type {
    DSQL_DatabaseSchemaType,
    DSQL_TableSchemaType,
} from "@moduletrace/datasquirel/dist/package-shared/types";
import _ from "lodash";
import generateTypeDefinition from "./generate-type-definitions";

type Params = {
    dbSchema?: DSQL_DatabaseSchemaType;
};

export default function dbSchemaToType(params?: Params): string[] | undefined {
    let datasquirelSchema = params?.dbSchema;

    if (!datasquirelSchema) return;

    let tableNames = `export const DsqlTables = [\n${datasquirelSchema.tables
        .map((tbl) => `    "${tbl.tableName}",`)
        .join("\n")}\n] as const`;

    const dbTablesSchemas = datasquirelSchema.tables;

    const defDbName = datasquirelSchema.dbName
        ?.toUpperCase()
        .replace(/ |\-/g, "_");

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
                typeDefName: `DSQL_${defDbName}_${final_table.tableName.toUpperCase()}`,
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
        ? `export type DSQL_${defDbName}_ALL_TYPEDEFS = ${defNames.join(` & `)}`
        : ``;

    return [tableNames, ...schemas, allTd];
}

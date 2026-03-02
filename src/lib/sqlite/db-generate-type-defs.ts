import type {
    BUN_SQLITE_FieldSchemaType,
    BUN_SQLITE_TableSchemaType,
} from "../../types";

type Param = {
    paradigm: "JavaScript" | "TypeScript" | undefined;
    table: BUN_SQLITE_TableSchemaType;
    query?: any;
    typeDefName?: string;
    allValuesOptional?: boolean;
    addExport?: boolean;
    dbName?: string;
};

export default function generateTypeDefinition({
    paradigm,
    table,
    query,
    typeDefName,
    allValuesOptional,
    addExport,
    dbName,
}: Param) {
    let typeDefinition: string | null = ``;
    let tdName: string | null = ``;

    try {
        tdName = typeDefName
            ? typeDefName
            : dbName
              ? `BUN_SQLITE_${dbName}_${table.tableName}`.toUpperCase()
              : `BUN_SQLITE_${query.single}_${query.single_table}`.toUpperCase();

        const fields = table.fields;

        function typeMap(schemaType: BUN_SQLITE_FieldSchemaType) {
            if (schemaType.options && schemaType.options.length > 0) {
                return schemaType.options
                    .map((opt) =>
                        schemaType.dataType?.match(/int/i) ||
                        typeof opt == "number"
                            ? `${opt}`
                            : `"${opt}"`,
                    )
                    .join(" | ");
            }

            if (schemaType.dataType?.match(/int|double|decimal/i)) {
                return "number";
            }

            if (schemaType.dataType?.match(/text|varchar|timestamp/i)) {
                return "string";
            }

            if (schemaType.dataType?.match(/boolean/i)) {
                return "0 | 1";
            }

            return "string";
        }

        const typesArrayTypeScript = [];
        const typesArrayJavascript = [];

        typesArrayTypeScript.push(
            `${addExport ? "export " : ""}type ${tdName} = {`,
        );
        typesArrayJavascript.push(`/**\n * @typedef {object} ${tdName}`);

        fields.forEach((field) => {
            if (field.fieldDescription) {
                typesArrayTypeScript.push(
                    `    /** \n     * ${field.fieldDescription}\n     */`,
                );
            }

            const nullValue = allValuesOptional
                ? "?"
                : field.notNullValue
                  ? ""
                  : "?";

            typesArrayTypeScript.push(
                `    ${field.fieldName}${nullValue}: ${typeMap(field)};`,
            );

            typesArrayJavascript.push(
                ` * @property {${typeMap(field)}${nullValue}} ${
                    field.fieldName
                }`,
            );
        });

        typesArrayTypeScript.push(`}`);
        typesArrayJavascript.push(` */`);

        if (paradigm?.match(/javascript/i)) {
            typeDefinition = typesArrayJavascript.join("\n");
        }

        if (paradigm?.match(/typescript/i)) {
            typeDefinition = typesArrayTypeScript.join("\n");
        }
    } catch (error: any) {
        console.log(error.message);
        typeDefinition = null;
    }

    return { typeDefinition, tdName };
}

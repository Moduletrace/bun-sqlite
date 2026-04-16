export default function generateTypeDefinition({ paradigm, table, query, typeDefName, allValuesOptional, addExport, dbName, }) {
    let typeDefinition = ``;
    let tdName = ``;
    try {
        tdName = typeDefName
            ? typeDefName
            : dbName
                ? `BUN_SQLITE_${dbName}_${table.tableName}`.toUpperCase()
                : `BUN_SQLITE_${query.single}_${query.single_table}`.toUpperCase();
        const fields = table.fields;
        function typeMap(schemaType) {
            if (schemaType.options && schemaType.options.length > 0) {
                let opts = schemaType.options.map((opt) => schemaType.dataType?.match(/int/i) || typeof opt == "number"
                    ? `${opt}`
                    : `"${opt}"`);
                opts.push(`""`);
                return opts.join(" | ");
            }
            if (schemaType.dataType?.match(/blob/i)) {
                return `Float32Array<ArrayBuffer> | Buffer<ArrayBuffer> | null`;
            }
            if (schemaType.dataType?.match(/int|double|decimal|real/i)) {
                return `number | ""`;
            }
            if (schemaType.dataType?.match(/text|varchar|timestamp/i)) {
                return `string`;
            }
            if (schemaType.dataType?.match(/boolean/i)) {
                return "0 | 1";
            }
            return "string";
        }
        const typesArrayTypeScript = [];
        const typesArrayJavascript = [];
        typesArrayTypeScript.push(`${addExport ? "export " : ""}type ${tdName} = {`);
        typesArrayJavascript.push(`/**\n * @typedef {object} ${tdName}`);
        fields.forEach((field) => {
            if (field.fieldDescription) {
                typesArrayTypeScript.push(`    /** \n     * ${field.fieldDescription}\n     */`);
            }
            const nullValue = allValuesOptional
                ? "?"
                : field.notNullValue
                    ? ""
                    : "?";
            typesArrayTypeScript.push(`    ${field.fieldName}${nullValue}: ${typeMap(field)};`);
            typesArrayJavascript.push(` * @property {${typeMap(field)}${nullValue}} ${field.fieldName}`);
        });
        typesArrayTypeScript.push(`}`);
        typesArrayJavascript.push(` */`);
        if (paradigm?.match(/javascript/i)) {
            typeDefinition = typesArrayJavascript.join("\n");
        }
        if (paradigm?.match(/typescript/i)) {
            typeDefinition = typesArrayTypeScript.join("\n");
        }
    }
    catch (error) {
        console.log(error.message);
        typeDefinition = null;
    }
    return { typeDefinition, tdName };
}

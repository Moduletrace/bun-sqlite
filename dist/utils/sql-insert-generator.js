/**
 * # SQL Insert Generator
 */
export default function sqlInsertGenerator({ tableName, data, dbFullName, }) {
    const finalDbName = dbFullName ? `${dbFullName}.` : "";
    try {
        if (Array.isArray(data) && data?.[0]) {
            let insertKeys = [];
            data.forEach((dt) => {
                const kys = Object.keys(dt);
                kys.forEach((ky) => {
                    if (!insertKeys.includes(ky)) {
                        insertKeys.push(ky);
                    }
                });
            });
            let queryBatches = [];
            let queryValues = [];
            data.forEach((item) => {
                queryBatches.push(`(${insertKeys
                    .map((ky) => {
                    const value = item[ky];
                    const finalValue = typeof value == "string" ||
                        typeof value == "number"
                        ? value
                        : typeof value == "function"
                            ? value().value
                            : value
                                ? value
                                : null;
                    if (!finalValue) {
                        queryValues.push("");
                        return "?";
                    }
                    queryValues.push(finalValue);
                    const placeholder = typeof value == "function"
                        ? value().placeholder
                        : "?";
                    return placeholder;
                })
                    .filter((k) => Boolean(k))
                    .join(",")})`);
            });
            let query = `INSERT INTO ${finalDbName}${tableName} (${insertKeys.join(",")}) VALUES ${queryBatches.join(",")}`;
            return {
                query: query,
                values: queryValues,
            };
        }
        else {
            return undefined;
        }
    }
    catch ( /** @type {any} */error) {
        console.log(`SQL insert gen ERROR: ${error.message}`);
        return undefined;
    }
}

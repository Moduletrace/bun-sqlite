export default function queryValueParser({ query_value, }) {
    if (typeof query_value == "string" || typeof query_value == "number") {
        return query_value;
    }
    if (Array.isArray(query_value)) {
        let values = [];
        for (let i = 0; i < query_value.length; i++) {
            const single_value = query_value[i];
            if (single_value) {
                const single_parsed_value = queryValueParser({
                    query_value: single_value,
                });
                if (!Array.isArray(single_parsed_value)) {
                    values.push(single_parsed_value);
                }
            }
        }
        return values;
    }
    return query_value?.value;
}

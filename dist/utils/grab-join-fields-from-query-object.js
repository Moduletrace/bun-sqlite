import _ from "lodash";
export default function grabJoinFieldsFromQueryObject({ query }) {
    const fields_values = [];
    const new_query = _.cloneDeep(query);
    if (new_query.join) {
        for (let i = 0; i < new_query.join.length; i++) {
            const join = new_query.join[i];
            if (!join)
                continue;
            if (Array.isArray(join)) {
                for (let i = 0; i < join.length; i++) {
                    const single_join = join[i];
                    fields_values.push(...grabSingleJoinData({
                        join: single_join,
                    }));
                }
            }
            else {
                fields_values.push(...grabSingleJoinData({
                    join: join,
                }));
            }
        }
    }
    return fields_values;
}
function grabSingleJoinData({ join, }) {
    let values = [];
    const join_select_fields = join?.selectFields;
    if (join_select_fields) {
        for (let i = 0; i < join_select_fields.length; i++) {
            const select_field = join_select_fields[i];
            if (select_field) {
                const value = join.match;
                values.push({
                    field: typeof select_field == "object"
                        ? String(select_field.field)
                        : String(select_field),
                    table: join.tableName,
                });
            }
        }
    }
    return values;
}

import _ from "lodash";
import { DefaultFields } from "../types";
export default function ({ dbSchema }) {
    const finaldbSchema = _.cloneDeep(dbSchema);
    finaldbSchema.tables = finaldbSchema.tables.map((t) => {
        const newTable = _.cloneDeep(t);
        newTable.fields = newTable.fields.filter((f) => !f.fieldName?.match(/^(id|created_at|updated_at)$/));
        newTable.fields.unshift(...DefaultFields);
        return newTable;
    });
    return finaldbSchema;
}

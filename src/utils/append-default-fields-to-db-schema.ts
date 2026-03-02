import _ from "lodash";
import { DefaultFields, type BUN_SQLITE_DatabaseSchemaType } from "../types";

type Params = {
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
};

export default function ({ dbSchema }: Params): BUN_SQLITE_DatabaseSchemaType {
    const finaldbSchema = _.cloneDeep(dbSchema);
    finaldbSchema.tables = finaldbSchema.tables.map((t) => {
        const newTable = _.cloneDeep(t);
        newTable.fields = newTable.fields.filter(
            (f) => !f.fieldName?.match(/^(id|created_at|updated_at)$/),
        );
        newTable.fields.unshift(...DefaultFields);
        return newTable;
    });

    return finaldbSchema;
}

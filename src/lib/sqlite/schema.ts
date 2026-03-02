import type {
    DSQL_DatabaseSchemaType,
    DSQL_FieldSchemaType,
} from "@moduletrace/datasquirel/dist/package-shared/types";
import _ from "lodash";

const DefaultFields: DSQL_FieldSchemaType[] = [
    {
        fieldName: "id",
        dataType: "INTEGER",
        primaryKey: true,
        autoIncrement: true,
        notNullValue: true,
        fieldDescription: "The unique identifier of the record.",
    },
    {
        fieldName: "created_at",
        dataType: "INTEGER",
        notNullValue: true,
        fieldDescription:
            "The time when the record was created. (Unix Timestamp)",
    },
    {
        fieldName: "updated_at",
        dataType: "INTEGER",
        notNullValue: true,
        fieldDescription:
            "The time when the record was updated. (Unix Timestamp)",
    },
];

export const DbSchema: DSQL_DatabaseSchemaType = {
    dbName: "travis-ai",
    tables: [],
};

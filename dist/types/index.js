export const UsersOmitedFields = [
    "password",
    "social_id",
    "verification_status",
    "date_created",
    "date_created_code",
    "date_created_timestamp",
    "date_updated",
    "date_updated_code",
    "date_updated_timestamp",
];
export const MariaDBCollations = [
    "utf8mb4_bin",
    "utf8mb4_unicode_520_ci",
];
export const TextFieldTypesArray = [
    { title: "Plain Text", value: "plain" },
    { title: "Rich Text", value: "richText" },
    { title: "Markdown", value: "markdown" },
    { title: "JSON", value: "json" },
    { title: "YAML", value: "yaml" },
    { title: "HTML", value: "html" },
    { title: "CSS", value: "css" },
    { title: "Javascript", value: "javascript" },
    { title: "Shell", value: "shell" },
    { title: "Code", value: "code" },
];
export const BUN_SQLITE_DATATYPES = [
    { value: "TEXT" },
    { value: "INTEGER" },
];
export const ServerQueryOperators = ["AND", "OR"];
export const ServerQueryEqualities = [
    "EQUAL",
    "LIKE",
    "LIKE_RAW",
    "LIKE_LOWER",
    "LIKE_LOWER_RAW",
    "NOT LIKE",
    "NOT LIKE_RAW",
    "NOT_LIKE_LOWER",
    "NOT_LIKE_LOWER_RAW",
    "NOT EQUAL",
    "REGEXP",
    "FULLTEXT",
    "IN",
    "NOT IN",
    "BETWEEN",
    "NOT BETWEEN",
    "IS NULL",
    "IS NOT NULL",
    "EXISTS",
    "NOT EXISTS",
    "GREATER THAN",
    "GREATER THAN OR EQUAL",
    "LESS THAN",
    "LESS THAN OR EQUAL",
    "MATCH",
    "MATCH_BOOLEAN",
];
export const DataCrudRequestMethods = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
];
export const DataCrudRequestMethodsLowerCase = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
];
export const DsqlCrudActions = ["insert", "update", "delete", "get"];
export const QueryFields = [
    "duplicate",
    "user_id",
    "delegated_user_id",
    "db_id",
    "table_id",
    "db_slug",
];
export const DockerComposeServices = [
    "setup",
    "cron",
    "reverse-proxy",
    "webapp",
    "websocket",
    "static",
    "db",
    "maxscale",
    "post-db-setup",
    "web-app-post-db-setup",
    "post-replica-db-setup",
    "db-replica-1",
    "db-replica-2",
    "db-cron",
    "web-app-post-db-setup",
];
export const IndexTypes = ["regular", "full_text", "vector"];
export const DefaultFields = [
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
        fieldDescription: "The time when the record was created. (Unix Timestamp)",
    },
    {
        fieldName: "updated_at",
        dataType: "INTEGER",
        fieldDescription: "The time when the record was updated. (Unix Timestamp)",
    },
];

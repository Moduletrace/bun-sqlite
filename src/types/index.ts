import type { RequestOptions } from "https";

/**
 * Fully-qualified database name used when a database needs to be referenced
 * across local and remote operations.
 */
export type BUN_SQLITE_DatabaseFullName = string;

/**
 * User fields that should be omitted from general-purpose payloads and public
 * responses.
 */
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
] as const;

/**
 * Describes an entire database schema, including its tables and clone/child
 * database metadata.
 */
export interface BUN_SQLITE_DatabaseSchemaType {
    id?: string | number;
    dbName?: string;
    dbSlug?: string;
    dbFullName?: string;
    dbDescription?: string;
    dbImage?: string;
    tables: BUN_SQLITE_TableSchemaType[];
    childrenDatabases?: BUN_SQLITE_ChildrenDatabaseObject[];
    childDatabase?: boolean;
    childDatabaseDbId?: string | number;
    updateData?: boolean;
    collation?: (typeof MariaDBCollations)[number];
}

/**
 * Minimal reference to a child database linked to a parent database schema.
 */
export interface BUN_SQLITE_ChildrenDatabaseObject {
    dbId?: string | number;
}

/**
 * Supported MariaDB collations that can be applied at the database or table
 * level.
 */
export const MariaDBCollations = [
    "utf8mb4_bin",
    "utf8mb4_unicode_520_ci",
] as const;

/**
 * Describes a single table within a database schema, including its fields,
 * indexes, unique constraints, and parent/child table relationships.
 */
export interface BUN_SQLITE_TableSchemaType {
    id?: string | number;
    tableName: string;
    tableDescription?: string;
    fields: BUN_SQLITE_FieldSchemaType[];
    indexes?: BUN_SQLITE_IndexSchemaType[];
    uniqueConstraints?: BUN_SQLITE_UniqueConstraintSchemaType[];
    childrenTables?: BUN_SQLITE_ChildrenTablesType[];
    /**
     * Whether this is a child table
     */
    childTable?: boolean;
    updateData?: boolean;
    /**
     * ID of the parent table
     */
    childTableId?: string | number;
    /**
     * ID of the parent table
     */
    parentTableId?: string | number;
    /**
     * ID of the Database of parent table
     */
    parentTableDbId?: string | number;
    /**
     * Name of the Database of parent table
     */
    parentTableDbName?: string;
    /**
     * Name of the parent table
     */
    parentTableName?: string;
    tableNameOld?: string;
    /**
     * ID of the Database of parent table
     */
    childTableDbId?: string | number;
    collation?: (typeof MariaDBCollations)[number];
    /**
     * If this is a vector table
     */
    isVector?: boolean;
    /**
     * Type of vector. Defaults to `vec0`
     */
    vectorType?: string;
}

/**
 * Reference object used to link a table to one of its child tables.
 */
export interface BUN_SQLITE_ChildrenTablesType {
    tableId?: string | number;
    dbId?: string | number;
}

/**
 * Supported editor/content modes for text fields.
 */
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
] as const;

/**
 * Core SQLite column types supported by the schema builder.
 */
export const BUN_SQLITE_DATATYPES = [
    { value: "TEXT" },
    { value: "INTEGER" },
    { value: "BLOB" },
    { value: "REAL" },
] as const;

/**
 * Describes a table column, including SQL constraints, text editor options,
 * vector metadata, and foreign key configuration.
 */
export type BUN_SQLITE_FieldSchemaType = {
    id?: number | string;
    fieldName?: string;
    fieldDescription?: string;
    originName?: string;
    // updatedField?: boolean;
    dataType: (typeof BUN_SQLITE_DATATYPES)[number]["value"];
    nullValue?: boolean;
    notNullValue?: boolean;
    primaryKey?: boolean;
    encrypted?: boolean;
    autoIncrement?: boolean;
    defaultValue?: string | number;
    defaultValueLiteral?: string;
    foreignKey?: BUN_SQLITE_ForeignKeyType;
    defaultField?: boolean;
    plainText?: boolean;
    unique?: boolean;
    pattern?: string;
    patternFlags?: string;
    onUpdate?: string;
    onUpdateLiteral?: string;
    onDelete?: string;
    onDeleteLiteral?: string;
    cssFiles?: string[];
    integerLength?: string | number;
    decimals?: string | number;
    code?: boolean;
    options?: (string | number)[];
    isVector?: boolean;
    vectorSize?: number;
    /**
     * ### Adds a `+` prefix to colums
     *  In sqlite-vec, the + prefix is a specialized syntax for Virtual Table Columns. It essentially tells the database: "Keep this data associated with the vector, but don't try to index it for math."
Here is the breakdown of why they matter and how they work:
1. Performance Separation
In a standard table, adding a massive TEXT column (like a 2,000-word article) slows down full-table scans. In a vec0 virtual table, columns prefixed with + are stored in a separate internal side-car table.
The Vector Index: Stays lean and fast for "Nearest Neighbor" math.
The Content: Is only fetched after the vector search identifies the winning rows.
2. The "No Join" Convenience
Normally, you would store vectors in one table and the actual text content in another, linking them with a FOREIGN KEY.
Without + columns: You must JOIN two tables to get the text after finding the vector.
With + columns: You can SELECT content directly from the virtual table. It handles the "join" logic internally, making your code cleaner.
3. Syntax Example
When defining your schema, the + is only used in the CREATE statement. When querying or inserting, you treat it like a normal name.
```sql
-- SCHEMA DEFINITION
CREATE VIRTUAL TABLE documents USING vec0(
  embedding float,     -- The vector (indexed)
  +title TEXT,         -- Side-car metadata (not indexed)
  +raw_body TEXT       -- Side-car "heavy" data (not indexed)
);

-- INSERTING (Notice: No '+' here)
INSERT INTO documents(embedding, title, raw_body) 
VALUES (vec_f32(?), 'Bun Docs', 'Bun is a fast JavaScript runtime...');

-- QUERYING (Notice: No '+' here)
SELECT title, raw_body 
FROM documents 
WHERE embedding MATCH ? AND k = 1;
```
     */
    sideCar?: boolean;
} & {
    [key in (typeof TextFieldTypesArray)[number]["value"]]?: boolean;
};

/**
 * Defines a foreign key relationship from one field to another table column.
 */
export interface BUN_SQLITE_ForeignKeyType {
    foreignKeyName?: string;
    destinationTableName?: string;
    destinationTableColumnName?: string;
    destinationTableColumnType?: string;
    cascadeDelete?: boolean;
    cascadeUpdate?: boolean;
}

/**
 * Describes a table index and the fields it covers.
 */
export interface BUN_SQLITE_IndexSchemaType {
    id?: string | number;
    indexName?: string;
    indexType?: (typeof IndexTypes)[number];
    indexTableFields?: BUN_SQLITE_IndexTableFieldType[];
    alias?: string;
    newTempIndex?: boolean;
}

/**
 * Describes a multi-field uniqueness rule for a table.
 */
export interface BUN_SQLITE_UniqueConstraintSchemaType {
    id?: string | number;
    constraintName?: string;
    alias?: string;
    constraintTableFields?: BUN_SQLITE_UniqueConstraintFieldType[];
}

/**
 * Single field reference inside a unique constraint definition.
 */
export interface BUN_SQLITE_UniqueConstraintFieldType {
    value: string;
}

/**
 * Field metadata used when generating SQL for indexes.
 */
export interface BUN_SQLITE_IndexTableFieldType {
    value: string;
    dataType: string;
}

/**
 * Result shape returned by MySQL `SHOW INDEXES` queries.
 */
export interface BUN_SQLITE_MYSQL_SHOW_INDEXES_Type {
    Key_name: string;
    Table: string;
    Column_name: string;
    Collation: string;
    Index_type: string;
    Cardinality: string;
    Index_comment: string;
    Comment: string;
}

/**
 * Result shape returned by MySQL `SHOW COLUMNS` queries.
 */
export interface BUN_SQLITE_MYSQL_SHOW_COLUMNS_Type {
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: string;
    Extra: string;
}

/**
 * Result shape returned by MariaDB `SHOW INDEXES` queries.
 */
export interface BUN_SQLITE_MARIADB_SHOW_INDEXES_TYPE {
    Table: string;
    Non_unique: 0 | 1;
    Key_name: string;
    Seq_in_index: number;
    Column_name: string;
    Collation: string;
    Cardinality: number;
    Sub_part?: string;
    Packed?: string;
    Index_type?: "BTREE";
    Comment?: string;
    Index_comment?: string;
    Ignored?: "YES" | "NO";
}

/**
 * Minimal metadata returned when listing MySQL foreign keys.
 */
export interface BUN_SQLITE_MYSQL_FOREIGN_KEYS_Type {
    CONSTRAINT_NAME: string;
    CONSTRAINT_SCHEMA: string;
    TABLE_NAME: string;
}

/**
 * Database record describing a user-owned database and optional remote sync
 * metadata.
 */
export interface BUN_SQLITE_MYSQL_user_databases_Type {
    id: number;
    user_id: number;
    db_full_name: string;
    db_name: string;
    db_slug: string;
    db_image: string;
    db_description: string;
    active_clone: number;
    active_data: 0 | 1;
    active_clone_parent_db: string;
    remote_connected?: number;
    remote_db_full_name?: string;
    remote_connection_host?: string;
    remote_connection_key?: string;
    remote_connection_type?: string;
    user_priviledge?: string;
    date_created?: string;
    image_thumbnail?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
}

/**
 * Return value used when converting an uploaded image file to base64.
 */
export type ImageInputFileToBase64FunctionReturn = {
    imageBase64?: string;
    imageBase64Full?: string;
    imageName?: string;
    imageSize?: number;
};

/**
 * Querystring parameters accepted by generic GET data endpoints.
 */
export interface GetReqQueryObject {
    db: string;
    query: string;
    queryValues?: string;
    tableName?: string;
    debug?: boolean;
}

/**
 * Canonical logged-in user shape shared across auth, session, and API flows.
 */
export type DATASQUIREL_LoggedInUser = {
    id: number;
    uuid?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    user_type?: string;
    username?: string;
    image?: string;
    image_thumbnail?: string;
    social_login?: number;
    social_platform?: string;
    social_id?: string;
    verification_status?: number;
    csrf_k: string;
    logged_in_status: boolean;
    date: number;
} & {
    [key: string]: any;
};

/**
 * Standard authenticated-user response wrapper.
 */
export interface AuthenticatedUser {
    success: boolean;
    payload: DATASQUIREL_LoggedInUser | null;
    msg?: string;
    userId?: number;
    cookieNames?: any;
}

/**
 * Minimal successful user payload returned by user creation flows.
 */
export interface SuccessUserObject {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

/**
 * Return type for helpers that create a user record.
 */
export interface AddUserFunctionReturn {
    success: boolean;
    payload?: SuccessUserObject | null;
    msg?: string;
    sqlResult?: any;
}

/**
 * Shape exposed by the Google Identity prompt lifecycle callback.
 */
export interface GoogleIdentityPromptNotification {
    getMomentType: () => string;
    getDismissedReason: () => string;
    getNotDisplayedReason: () => string;
    getSkippedReason: () => string;
    isDismissedMoment: () => boolean;
    isDisplayMoment: () => boolean;
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    isSkippedMoment: () => boolean;
}

/**
 * User data accepted by registration and profile-creation flows.
 */
export type UserDataPayload = {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    username?: string;
} & {
    [key: string]: any;
};

/**
 * Return shape for helpers that fetch a single user.
 */
export interface GetUserFunctionReturn {
    success: boolean;
    payload: {
        id: number;
        first_name: string;
        last_name: string;
        username: string;
        email: string;
        phone: string;
        social_id: [string];
        image: string;
        image_thumbnail: string;
        verification_status: [number];
    } | null;
}

/**
 * Return type for reauthentication flows that refresh auth state.
 */
export interface ReauthUserFunctionReturn {
    success: boolean;
    payload: DATASQUIREL_LoggedInUser | null;
    msg?: string;
    userId?: number;
    token?: string;
}

/**
 * Return type for user update helpers.
 */
export interface UpdateUserFunctionReturn {
    success: boolean;
    payload?: Object[] | string;
}

/**
 * Generic success/error wrapper for read operations.
 */
export interface GetReturn<R extends any = any> {
    success: boolean;
    payload?: R;
    msg?: string;
    error?: string;
    schema?: BUN_SQLITE_TableSchemaType;
    finalQuery?: string;
}

/**
 * Query parameters used when requesting schema metadata.
 */
export interface GetSchemaRequestQuery {
    database?: string;
    table?: string;
    field?: string;
    user_id?: string | number;
    env?: { [k: string]: string };
}

/**
 * API credential payload used when a schema request must be authenticated.
 */
export interface GetSchemaAPICredentialsParam {
    key: string;
}

/**
 * Complete request object for authenticated schema fetches.
 */
export type GetSchemaAPIParam = GetSchemaRequestQuery &
    GetSchemaAPICredentialsParam;

/**
 * Generic response wrapper for write operations.
 */
export interface PostReturn {
    success: boolean;
    payload?: Object[] | string | PostInsertReturn;
    msg?: string;
    error?: any;
    schema?: BUN_SQLITE_TableSchemaType;
}

/**
 * High-level CRUD payload accepted by server-side data mutation handlers.
 */
export interface PostDataPayload {
    action: "insert" | "update" | "delete";
    table: string;
    data?: object;
    identifierColumnName?: string;
    identifierValue?: string;
    duplicateColumnName?: string;
    duplicateColumnValue?: string;
    update?: boolean;
}

/**
 * Local-only variant of `PostReturn` used by in-process operations.
 */
export interface LocalPostReturn {
    success: boolean;
    payload?: any;
    msg?: string;
    error?: string;
}

/**
 * Query object for local write operations that may accept raw SQL or a CRUD
 * payload.
 */
export interface LocalPostQueryObject {
    query: string | PostDataPayload;
    tableName?: string;
    queryValues?: string[];
}

/**
 * Insert/update metadata returned by SQL drivers after a write completes.
 */
export interface PostInsertReturn {
    fieldCount?: number;
    affectedRows?: number;
    insertId?: number;
    serverStatus?: number;
    warningCount?: number;
    message?: string;
    protocol41?: boolean;
    changedRows?: number;
    error?: string;
}

/**
 * Extended user object used within the application runtime.
 */
export type UserType = DATASQUIREL_LoggedInUser & {
    isSuperUser?: boolean;
    staticHost?: string;
    appHost?: string;
    appName?: string;
};

/**
 * Stored API key definition and its associated metadata.
 */
export interface ApiKeyDef {
    name: string;
    scope: string;
    date_created: string;
    apiKeyPayload: string;
}

/**
 * Aggregate dashboard metrics shown in admin and overview screens.
 */
export interface MetricsType {
    dbCount: number;
    tablesCount: number;
    mediaCount: number;
    apiKeysCount: number;
}

/**
 * Shape of the internal MariaDB users table.
 */
export interface MYSQL_mariadb_users_table_def {
    id?: number;
    user_id?: number;
    username?: string;
    host?: string;
    password?: string;
    primary?: number;
    grants?: string;
    date_created?: string;
    date_created_code?: number;
    date_created_timestamp?: string;
    date_updated?: string;
    date_updated_code?: number;
    date_updated_timestamp?: string;
}

/**
 * Credentials used to connect to a MariaDB instance as a specific user.
 */
export interface MariaDBUserCredType {
    mariadb_user?: string;
    mariadb_host?: string;
    mariadb_pass?: string;
}

/**
 * Supported logical operators for server-side query generation.
 */
export const ServerQueryOperators = ["AND", "OR"] as const;
/**
 * Supported comparison operators for server-side query generation.
 */
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
] as const;

/**
 * Top-level query-builder input used to generate SELECT statements, joins,
 * grouping, pagination, and full-text search clauses.
 */
export type ServerQueryParam<
    T extends { [k: string]: any } = { [k: string]: any },
    K extends string = string,
> = {
    selectFields?: (keyof T | TableSelectFieldsObject<T>)[];
    omitFields?: (keyof T)[];
    query?: ServerQueryQueryObject<T>;
    limit?: number;
    page?: number;
    offset?: number;
    order?: ServerQueryParamOrder<T> | ServerQueryParamOrder<T>[];
    searchOperator?: (typeof ServerQueryOperators)[number];
    searchEquality?: (typeof ServerQueryEqualities)[number];
    addUserId?: {
        fieldName: keyof T;
    };
    join?: (
        | ServerQueryParamsJoin<K>
        | ServerQueryParamsJoin<K>[]
        | undefined
    )[];
    group?:
        | keyof T
        | ServerQueryParamGroupBy<T>
        | (keyof T | ServerQueryParamGroupBy<T>)[];
    countSubQueries?: ServerQueryParamsCount[];
    fullTextSearch?: ServerQueryParamFullTextSearch<T>;
    [key: string]: any;
};

/**
 * Represents a single `GROUP BY` field, optionally qualified by table name.
 */
export type ServerQueryParamGroupBy<
    T extends { [k: string]: any } = { [k: string]: any },
> = {
    field: keyof T;
    table?: string;
};

/**
 * Represents a single `ORDER BY` clause.
 */
export type ServerQueryParamOrder<
    T extends { [k: string]: any } = { [k: string]: any },
> = {
    field: keyof T;
    strategy: "ASC" | "DESC";
};

/**
 * Configuration for a full-text search query and the alias used for the score
 * column.
 */
export type ServerQueryParamFullTextSearch<
    T extends { [k: string]: any } = { [k: string]: any },
> = {
    fields: (keyof T)[];
    searchTerm: string;
    /** Field Name to user to Rank the Score of Search Results */
    scoreAlias: string;
};

/**
 * Describes a count subquery that is projected into the main SELECT result.
 */
export type ServerQueryParamsCount = {
    table: string;
    /** Alias for the Table From which the count is fetched */
    table_alias?: string;
    srcTrgMap: {
        src: string;
        trg: string | ServerQueryParamsCountSrcTrgMap;
    }[];
    alias: string;
};

/**
 * Source/target mapping used inside count subqueries.
 */
export type ServerQueryParamsCountSrcTrgMap = {
    table: string;
    field: string;
};

/**
 * Declares a selected field and an optional alias for the result set.
 */
export type TableSelectFieldsObject<
    T extends { [k: string]: any } = { [k: string]: any },
> = {
    fieldName: keyof T;
    alias?: string;
};

/**
 * Value wrapper used when a query condition needs per-value metadata such as a
 * custom equality or explicit table/field names.
 */
export type ServerQueryValuesObject = {
    value?: string | number;
    /**
     * Defaults to EQUAL
     */
    equality?: (typeof ServerQueryEqualities)[number];
    tableName?: string;
    fieldName?: string;
};

/**
 * All value shapes accepted by a query condition, including arrays used by
 * operators such as `IN` and `BETWEEN`.
 */
export type ServerQueryObjectValue =
    | string
    | number
    | ServerQueryValuesObject
    | undefined
    | null
    | (string | number | ServerQueryValuesObject | undefined | null)[];

/**
 * Describes a single query condition and any nested subconditions for a field.
 */
export type ServerQueryObject<
    T extends object = { [key: string]: any },
    K extends string = string,
> = {
    value?: ServerQueryObjectValue;
    nullValue?: boolean;
    notNullValue?: boolean;
    operator?: (typeof ServerQueryOperators)[number];
    equality?: (typeof ServerQueryEqualities)[number];
    tableName?: K;
    /**
     * This will replace the top level field name if
     * provided
     */
    fieldName?: string;
    __query?: {
        [key in keyof T]: Omit<ServerQueryObject<T>, "__query">;
    };
    vector?: boolean;
    /**
     * ### The Function to be used to generate the vector.
     * Eg. `vec_f32`. This will come out as `vec_f32(?)`
     * instead of just `?`
     */
    vectorFunction?: string;
};

/**
 * Field-to-condition map for server-side query generation.
 */
export type ServerQueryQueryObject<
    T extends object = { [key: string]: any },
    K extends string = string,
> = {
    [key in keyof T]: ServerQueryObject<T, K>;
};

/**
 * Parameters for authenticated fetch helpers used by the frontend and internal
 * SDK layers.
 */
export type FetchDataParams = {
    path: string;
    method?: (typeof DataCrudRequestMethods)[number];
    body?: object | string;
    query?: AuthFetchQuery;
    tableName?: string;
};

/**
 * Query object accepted by authenticated data-fetch helpers.
 */
export type AuthFetchQuery = ServerQueryParam & {
    [key: string]: any;
};

/**
 * Join clause definition used by the server query builder.
 */
export type ServerQueryParamsJoin<
    Table extends string = string,
    Field extends object = { [key: string]: any },
> = {
    joinType: "INNER JOIN" | "JOIN" | "LEFT JOIN" | "RIGHT JOIN";
    alias?: string;
    tableName: Table;
    match?:
        | ServerQueryParamsJoinMatchObject<Field>
        | ServerQueryParamsJoinMatchObject<Field>[];
    selectFields?: (
        | keyof Field
        | {
              field: keyof Field;
              alias?: string;
              count?: boolean;
          }
    )[];
    omitFields?: (
        | keyof Field
        | {
              field: keyof Field;
              alias?: string;
              count?: boolean;
          }
    )[];
    operator?: (typeof ServerQueryOperators)[number];
};

/**
 * Defines how a root-table field maps to a join-table field in an `ON` clause.
 */
export type ServerQueryParamsJoinMatchObject<
    Field extends object = { [key: string]: any },
> = {
    /** Field name from the **Root Table** */
    source?: string | ServerQueryParamsJoinMatchSourceTargetObject;
    /** Field name from the **Join Table** */
    target?: keyof Field | ServerQueryParamsJoinMatchSourceTargetObject;
    /** A literal value: No source and target Needed! */
    targetLiteral?: string | number;
    __batch?: {
        matches: Omit<ServerQueryParamsJoinMatchObject<Field>, "__batch">[];
        operator: "AND" | "OR";
    };
};

/**
 * Explicit table/field reference for join match definitions.
 */
export type ServerQueryParamsJoinMatchSourceTargetObject = {
    tableName: string;
    fieldName: string;
};

/**
 * Payload used when pushing or pulling a schema to or from a remote API.
 */
export type ApiConnectBody = {
    url: string;
    key: string;
    database: BUN_SQLITE_MYSQL_user_databases_Type;
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
    type: "pull" | "push";
    user_id?: string | number;
};

/**
 * Superuser credentials and auth state.
 */
export type SuUserType = {
    email: string;
    password: string;
    authKey: string;
    logged_in_status: boolean;
    date: number;
};

/**
 * Configuration for a remote MariaDB host in replicated or load-balanced
 * setups.
 */
export type MariadbRemoteServerObject = {
    host: string;
    port: number;
    primary?: boolean;
    loadBalanced?: boolean;
    users?: MariadbRemoteServerUserObject[];
};

/**
 * Credentials for a user provisioned on a remote MariaDB server.
 */
export type MariadbRemoteServerUserObject = {
    name: string;
    password: string;
    host: string;
};

/**
 * Standard login response returned by API authentication helpers.
 */
export type APILoginFunctionReturn = {
    success: boolean;
    msg?: string;
    payload?: DATASQUIREL_LoggedInUser | null;
    userId?: number | string;
    key?: string;
    token?: string;
    csrf?: string;
    cookieNames?: any;
};

/**
 * Parameters required to create a user through the public API layer.
 */
export type APICreateUserFunctionParams = {
    encryptionKey?: string;
    payload: any;
    database: string;
    dsqlUserID?: string | number;
    verify?: boolean;
};

/**
 * Function signature for API user-creation handlers.
 */
export type APICreateUserFunction = (
    params: APICreateUserFunctionParams,
) => Promise<AddUserFunctionReturn>;

/**
 * Result returned when reconciling a social login with the local user store.
 */
export type HandleSocialDbFunctionReturn = {
    success: boolean;
    user?: DATASQUIREL_LoggedInUser | null;
    msg?: string;
    social_id?: string | number;
    social_platform?: string;
    payload?: any;
    alert?: boolean;
    newUser?: any;
    error?: any;
} | null;

/**
 * Cookie definition used when setting auth/session cookies.
 */
export type CookieObject = {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: Date;
    maxAge?: number;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    priority?: "Low" | "Medium" | "High";
};

/**
 * Request options accepted by the generic HTTP client helper.
 */
export type HttpRequestParams<
    ReqObj extends { [k: string]: any } = { [k: string]: any },
> = RequestOptions & {
    scheme?: "http" | "https";
    body?: ReqObj;
    query?: ReqObj;
    urlEncodedFormBody?: boolean;
};

/**
 * Function signature for the generic HTTP request helper.
 */
export type HttpRequestFunction<
    ReqObj extends { [k: string]: any } = { [k: string]: any },
    ResObj extends { [k: string]: any } = { [k: string]: any },
> = (param: HttpRequestParams<ReqObj>) => Promise<HttpFunctionResponse<ResObj>>;

/**
 * Normalized response returned by the generic HTTP request helper.
 */
export type HttpFunctionResponse<
    ResObj extends { [k: string]: any } = { [k: string]: any },
> = {
    status: number;
    data?: ResObj;
    error?: string;
    str?: string;
    requestedPath?: string;
};

/**
 * GET request payload for API data reads.
 */
export type ApiGetQueryObject<
    T extends { [k: string]: any } = { [k: string]: any },
> = {
    query: ServerQueryParam<T>;
    table: string;
    dbFullName?: string;
};

/**
 * Uppercase HTTP methods supported by the CRUD helpers.
 */
export const DataCrudRequestMethods = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
] as const;

/**
 * Lowercase variant of the supported HTTP methods, used where string casing
 * must match external APIs.
 */
export const DataCrudRequestMethodsLowerCase = [
    "get",
    "post",
    "put",
    "patch",
    "delete",
    "options",
] as const;

/**
 * Runtime parameters passed to generic CRUD handlers.
 */
export type DsqlMethodCrudParam<
    T extends { [key: string]: any } = { [key: string]: any },
> = {
    method: (typeof DataCrudRequestMethods)[number];
    body?: T;
    query?: DsqlCrudQueryObject<T>;
    tableName: string;
    addUser?: {
        field: keyof T;
    };
    user?: DATASQUIREL_LoggedInUser;
    extraData?: T;
    transformData?: DsqlCrudTransformDataFunction<T>;
    transformQuery?: DsqlCrudTransformQueryFunction<T>;
    existingData?: T;
    targetId?: string | number;
    sanitize?: ({ data, batchData }: { data?: T; batchData?: T[] }) => T | T[];
    debug?: boolean;
};

/**
 * Hook used to mutate input data before a CRUD action is executed.
 */
export type DsqlCrudTransformDataFunction<
    T extends { [key: string]: any } = { [key: string]: any },
> = (params: {
    data: T;
    user?: DATASQUIREL_LoggedInUser;
    existingData?: T;
    reqMethod: (typeof DataCrudRequestMethods)[number];
}) => Promise<T>;

/**
 * Hook used to mutate query input before a CRUD action is executed.
 */
export type DsqlCrudTransformQueryFunction<
    T extends { [key: string]: any } = { [key: string]: any },
> = (params: {
    query: DsqlCrudQueryObject<T>;
    user?: DATASQUIREL_LoggedInUser;
    reqMethod: (typeof DataCrudRequestMethods)[number];
}) => Promise<DsqlCrudQueryObject<T>>;

/**
 * High-level CRUD actions supported by the DSQL helpers.
 */
export const DsqlCrudActions = ["insert", "update", "delete", "get"] as const;

/**
 * Query object used by CRUD helpers, built on top of the server query builder.
 */
export type DsqlCrudQueryObject<
    T extends { [key: string]: any } = { [key: string]: any },
    K extends string = string,
> = ServerQueryParam<T, K> & {
    query?: ServerQueryQueryObject<T, K>;
};

/**
 * Parameters used to generate a SQL `DELETE` statement.
 */
export type SQLDeleteGeneratorParams<
    T extends { [key: string]: any } = { [key: string]: any },
> = {
    tableName: string;
    deleteKeyValues?: SQLDeleteData<T>[];
    deleteKeyValuesOperator?: "AND" | "OR";
    dbFullName?: string;
    data?: any;
};

/**
 * Single key/value predicate used by the delete SQL generator.
 */
export type SQLDeleteData<
    T extends { [key: string]: any } = { [key: string]: any },
> = {
    key: keyof T;
    value: string | number | null | undefined;
    operator?: (typeof ServerQueryEqualities)[number];
};

/**
 * Prebuilt SQL where-clause fragment and its bound parameters.
 */
export type DsqlCrudParamWhereClause = {
    clause: string;
    params?: string[];
};

/**
 * Callback signature used when surfacing internal errors to callers.
 */
export type ErrorCallback = (title: string, error: Error, data?: any) => void;

/**
 * Reserved query parameter names used throughout the API layer.
 */
export const QueryFields = [
    "duplicate",
    "user_id",
    "delegated_user_id",
    "db_id",
    "table_id",
    "db_slug",
] as const;

/**
 * Minimal representation of a local folder entry.
 */
export type LocalFolderType = {
    name: string;
    isPrivate: boolean;
};

/**
 * SQL string and bound parameters produced during query generation.
 */
export type ResponseQueryObject = {
    sql?: string;
    params?: (string | number)[];
};

/**
 * Common API response wrapper used by data, auth, media, and utility
 * endpoints.
 */
export type APIResponseObject<
    T extends { [k: string]: any } = { [k: string]: any },
> = {
    success: boolean;
    payload?: T[] | null;
    singleRes?: T | null;
    stringRes?: string | null;
    numberRes?: number | null;
    postInsertReturn?: PostInsertReturn | null;
    payloadBase64?: string;
    payloadThumbnailBase64?: string;
    payloadURL?: string;
    payloadThumbnailURL?: string;
    error?: any;
    msg?: string;
    queryObject?: ResponseQueryObject;
    countQueryObject?: ResponseQueryObject;
    status?: number;
    count?: number;
    errors?: BUNSQLITEErrorObject[];
    debug?: any;
    batchPayload?: any[][] | null;
    errorData?: any;
    token?: string;
    csrf?: string;
    cookieNames?: any;
    key?: string;
    userId?: string | number;
    code?: string;
    createdAt?: number;
    email?: string;
    requestOptions?: RequestOptions;
    logoutUser?: boolean;
    redirect?: string;
};

/**
 * # Docker Compose Types
 */
export type DockerCompose = {
    services: DockerComposeServicesType;
    networks: DockerComposeNetworks;
    name: string;
};

/**
 * Supported Docker Compose service names used by the deployment helpers.
 */
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
] as const;

/**
 * Map of compose service names to service definitions.
 */
export type DockerComposeServicesType = {
    [key in (typeof DockerComposeServices)[number]]: DockerComposeServiceWithBuildObject;
};

/**
 * Docker Compose network definitions.
 */
export type DockerComposeNetworks = {
    [k: string]: {
        driver?: "bridge";
        ipam?: {
            config: DockerComposeNetworkConfigObject[];
        };
        external?: boolean;
    };
};

/**
 * Static network config for a Docker Compose network.
 */
export type DockerComposeNetworkConfigObject = {
    subnet: string;
    gateway: string;
};

/**
 * Service definition for compose services that are built from source.
 */
export type DockerComposeServiceWithBuildObject = {
    build: DockerComposeServicesBuildObject;
    env_file: string;
    container_name: string;
    hostname: string;
    volumes: string[];
    environment: string[];
    ports?: string[];
    networks?: DockerComposeServiceNetworkObject;
    restart?: string;
    depends_on?: {
        [k: string]: {
            condition: string;
        };
    };
    user?: string;
};

/**
 * Service definition for compose services that use a prebuilt image.
 */
export type DockerComposeServiceWithImage = Omit<
    DockerComposeServiceWithBuildObject,
    "build"
> & {
    image: string;
};

/**
 * Build instructions for a Docker Compose service.
 */
export type DockerComposeServicesBuildObject = {
    context: string;
    dockerfile: string;
};

/**
 * Per-network addressing information for a Docker Compose service.
 */
export type DockerComposeServiceNetworkObject = {
    [k: string]: {
        ipv4_address: string;
    };
};

/**
 * Metadata recorded for a table cloned from another database.
 */
export type ClonedTableInfo = {
    dbId?: string | number;
    tableId?: string | number;
    keepUpdated?: boolean;
    keepDataUpdated?: boolean;
};

/**
 * Common columns present on default/generated table entries.
 */
export type DefaultEntryType = {
    id?: number;
    uuid?: string;
    date_created?: string;
    date_created_code?: number;
    date_created_timestamp?: string;
    date_updated?: string;
    date_updated_code?: number;
    date_updated_timestamp?: string;
} & {
    [k: string]: string | number | null;
};

/**
 * Supported index strategies for generated schemas.
 */
export const IndexTypes = ["regular", "full_text", "vector"] as const;

/**
 * Structured error payload captured alongside generated SQL.
 */
export type BUNSQLITEErrorObject = {
    sql?: string;
    sqlValues?: any[];
    error?: string;
};

/**
 * Output of the SQL insert generator.
 */
export interface SQLInsertGenReturn {
    query: string;
    values: SQLInsertGenValueType[];
}

/**
 * Values accepted by the SQL insert generator, including vector buffers.
 */
export type SQLInsertGenValueType =
    | string
    | number
    | Float32Array<ArrayBuffer>
    | Buffer<ArrayBuffer>;

/**
 * Callback variant used when a generated insert value needs a custom
 * placeholder.
 */
export type SQLInsertGenDataFn = () => {
    placeholder: string;
    value: SQLInsertGenValueType;
};

/**
 * Record shape accepted by the SQL insert generator.
 */
export type SQLInsertGenDataType = {
    [k: string]: SQLInsertGenValueType | SQLInsertGenDataFn | undefined | null;
};

/**
 * Parameters used to build a multi-row SQL insert statement.
 */
export type SQLInsertGenParams = {
    data: SQLInsertGenDataType[];
    tableName: string;
    dbFullName?: string;
};

/**
 * Library configuration used to locate the SQLite database, schema file,
 * generated types, and backup settings.
 */
export type BunSQLiteConfig = {
    db_name: string;
    /**
     * The Name of the Database Schema File. Eg `db_schema.ts`. This is
     * relative to `db_dir`, or root dir if `db_dir` is not provided
     */
    db_schema_file_name: string;
    /**
     * The Directory for backups. Relative to db_dir.
     */
    db_backup_dir?: string;
    max_backups?: number;
    /**
     * The Root Directory for the DB file and schema
     */
    db_dir?: string;
    /**
     * The File Path relative to the root(working) directory for the type
     * definition export. Example `db_types.ts` or `types/db_types.ts`
     */
    typedef_file_path?: string;
};

/**
 * Resolved Bun SQLite config paired with the loaded database schema.
 */
export type BunSQLiteConfigReturn = {
    config: BunSQLiteConfig;
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
};

/**
 * Default fields automatically suggested for new tables.
 */
export const DefaultFields: BUN_SQLITE_FieldSchemaType[] = [
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
        fieldDescription:
            "The time when the record was created. (Unix Timestamp)",
    },
    {
        fieldName: "updated_at",
        dataType: "INTEGER",
        fieldDescription:
            "The time when the record was updated. (Unix Timestamp)",
    },
];

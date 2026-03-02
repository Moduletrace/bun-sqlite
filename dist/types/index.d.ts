import type { RequestOptions } from "https";
export type BUN_SQLITE_DatabaseFullName = string;
export declare const UsersOmitedFields: readonly ["password", "social_id", "verification_status", "date_created", "date_created_code", "date_created_timestamp", "date_updated", "date_updated_code", "date_updated_timestamp"];
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
export interface BUN_SQLITE_ChildrenDatabaseObject {
    dbId?: string | number;
}
export declare const MariaDBCollations: readonly ["utf8mb4_bin", "utf8mb4_unicode_520_ci"];
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
    isVector?: boolean;
    vectorType?: string;
}
export interface BUN_SQLITE_ChildrenTablesType {
    tableId?: string | number;
    dbId?: string | number;
}
export declare const TextFieldTypesArray: readonly [{
    readonly title: "Plain Text";
    readonly value: "plain";
}, {
    readonly title: "Rich Text";
    readonly value: "richText";
}, {
    readonly title: "Markdown";
    readonly value: "markdown";
}, {
    readonly title: "JSON";
    readonly value: "json";
}, {
    readonly title: "YAML";
    readonly value: "yaml";
}, {
    readonly title: "HTML";
    readonly value: "html";
}, {
    readonly title: "CSS";
    readonly value: "css";
}, {
    readonly title: "Javascript";
    readonly value: "javascript";
}, {
    readonly title: "Shell";
    readonly value: "shell";
}, {
    readonly title: "Code";
    readonly value: "code";
}];
export declare const BUN_SQLITE_DATATYPES: readonly [{
    readonly value: "TEXT";
}, {
    readonly value: "INTEGER";
}];
export type BUN_SQLITE_FieldSchemaType = {
    id?: number | string;
    fieldName?: string;
    fieldDescription?: string;
    originName?: string;
    updatedField?: boolean;
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
export interface BUN_SQLITE_ForeignKeyType {
    foreignKeyName?: string;
    destinationTableName?: string;
    destinationTableColumnName?: string;
    destinationTableColumnType?: string;
    cascadeDelete?: boolean;
    cascadeUpdate?: boolean;
}
export interface BUN_SQLITE_IndexSchemaType {
    id?: string | number;
    indexName?: string;
    indexType?: (typeof IndexTypes)[number];
    indexTableFields?: BUN_SQLITE_IndexTableFieldType[];
    alias?: string;
    newTempIndex?: boolean;
}
export interface BUN_SQLITE_UniqueConstraintSchemaType {
    id?: string | number;
    constraintName?: string;
    alias?: string;
    constraintTableFields?: BUN_SQLITE_UniqueConstraintFieldType[];
}
export interface BUN_SQLITE_UniqueConstraintFieldType {
    value: string;
}
export interface BUN_SQLITE_IndexTableFieldType {
    value: string;
    dataType: string;
}
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
export interface BUN_SQLITE_MYSQL_SHOW_COLUMNS_Type {
    Field: string;
    Type: string;
    Null: string;
    Key: string;
    Default: string;
    Extra: string;
}
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
export interface BUN_SQLITE_MYSQL_FOREIGN_KEYS_Type {
    CONSTRAINT_NAME: string;
    CONSTRAINT_SCHEMA: string;
    TABLE_NAME: string;
}
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
export type ImageInputFileToBase64FunctionReturn = {
    imageBase64?: string;
    imageBase64Full?: string;
    imageName?: string;
    imageSize?: number;
};
export interface GetReqQueryObject {
    db: string;
    query: string;
    queryValues?: string;
    tableName?: string;
    debug?: boolean;
}
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
export interface AuthenticatedUser {
    success: boolean;
    payload: DATASQUIREL_LoggedInUser | null;
    msg?: string;
    userId?: number;
    cookieNames?: any;
}
export interface SuccessUserObject {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}
export interface AddUserFunctionReturn {
    success: boolean;
    payload?: SuccessUserObject | null;
    msg?: string;
    sqlResult?: any;
}
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
export type UserDataPayload = {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    username?: string;
} & {
    [key: string]: any;
};
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
export interface ReauthUserFunctionReturn {
    success: boolean;
    payload: DATASQUIREL_LoggedInUser | null;
    msg?: string;
    userId?: number;
    token?: string;
}
export interface UpdateUserFunctionReturn {
    success: boolean;
    payload?: Object[] | string;
}
export interface GetReturn<R extends any = any> {
    success: boolean;
    payload?: R;
    msg?: string;
    error?: string;
    schema?: BUN_SQLITE_TableSchemaType;
    finalQuery?: string;
}
export interface GetSchemaRequestQuery {
    database?: string;
    table?: string;
    field?: string;
    user_id?: string | number;
    env?: {
        [k: string]: string;
    };
}
export interface GetSchemaAPICredentialsParam {
    key: string;
}
export type GetSchemaAPIParam = GetSchemaRequestQuery & GetSchemaAPICredentialsParam;
export interface PostReturn {
    success: boolean;
    payload?: Object[] | string | PostInsertReturn;
    msg?: string;
    error?: any;
    schema?: BUN_SQLITE_TableSchemaType;
}
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
export interface LocalPostReturn {
    success: boolean;
    payload?: any;
    msg?: string;
    error?: string;
}
export interface LocalPostQueryObject {
    query: string | PostDataPayload;
    tableName?: string;
    queryValues?: string[];
}
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
export type UserType = DATASQUIREL_LoggedInUser & {
    isSuperUser?: boolean;
    staticHost?: string;
    appHost?: string;
    appName?: string;
};
export interface ApiKeyDef {
    name: string;
    scope: string;
    date_created: string;
    apiKeyPayload: string;
}
export interface MetricsType {
    dbCount: number;
    tablesCount: number;
    mediaCount: number;
    apiKeysCount: number;
}
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
export interface MariaDBUserCredType {
    mariadb_user?: string;
    mariadb_host?: string;
    mariadb_pass?: string;
}
export declare const ServerQueryOperators: readonly ["AND", "OR"];
export declare const ServerQueryEqualities: readonly ["EQUAL", "LIKE", "LIKE_RAW", "LIKE_LOWER", "LIKE_LOWER_RAW", "NOT LIKE", "NOT LIKE_RAW", "NOT_LIKE_LOWER", "NOT_LIKE_LOWER_RAW", "NOT EQUAL", "REGEXP", "FULLTEXT", "IN", "NOT IN", "BETWEEN", "NOT BETWEEN", "IS NULL", "IS NOT NULL", "EXISTS", "NOT EXISTS", "GREATER THAN", "GREATER THAN OR EQUAL", "LESS THAN", "LESS THAN OR EQUAL", "MATCH", "MATCH_BOOLEAN"];
export type ServerQueryParam<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, K extends string = string> = {
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
    join?: (ServerQueryParamsJoin<K> | ServerQueryParamsJoin<K>[] | undefined)[];
    group?: keyof T | ServerQueryParamGroupBy<T> | (keyof T | ServerQueryParamGroupBy<T>)[];
    countSubQueries?: ServerQueryParamsCount[];
    fullTextSearch?: ServerQueryParamFullTextSearch<T>;
    [key: string]: any;
};
export type ServerQueryParamGroupBy<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    field: keyof T;
    table?: string;
};
export type ServerQueryParamOrder<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    field: keyof T;
    strategy: "ASC" | "DESC";
};
export type ServerQueryParamFullTextSearch<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    fields: (keyof T)[];
    searchTerm: string;
    /** Field Name to user to Rank the Score of Search Results */
    scoreAlias: string;
};
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
export type ServerQueryParamsCountSrcTrgMap = {
    table: string;
    field: string;
};
export type TableSelectFieldsObject<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    fieldName: keyof T;
    alias?: string;
};
export type ServerQueryValuesObject = {
    value?: string | number;
    equality?: (typeof ServerQueryEqualities)[number];
    tableName?: string;
    fieldName?: string;
};
export type ServerQueryObjectValue = string | (string | ServerQueryValuesObject | undefined | null) | (string | ServerQueryValuesObject | undefined | null)[];
export type ServerQueryObject<T extends object = {
    [key: string]: any;
}, K extends string = string> = {
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
export type ServerQueryQueryObject<T extends object = {
    [key: string]: any;
}, K extends string = string> = {
    [key in keyof T]: ServerQueryObject<T, K>;
};
export type FetchDataParams = {
    path: string;
    method?: (typeof DataCrudRequestMethods)[number];
    body?: object | string;
    query?: AuthFetchQuery;
    tableName?: string;
};
export type AuthFetchQuery = ServerQueryParam & {
    [key: string]: any;
};
export type ServerQueryParamsJoin<Table extends string = string, Field extends object = {
    [key: string]: any;
}> = {
    joinType: "INNER JOIN" | "JOIN" | "LEFT JOIN" | "RIGHT JOIN";
    alias?: string;
    tableName: Table;
    match?: ServerQueryParamsJoinMatchObject<Field> | ServerQueryParamsJoinMatchObject<Field>[];
    selectFields?: (keyof Field | {
        field: keyof Field;
        alias?: string;
        count?: boolean;
    })[];
    omitFields?: (keyof Field | {
        field: keyof Field;
        alias?: string;
        count?: boolean;
    })[];
    operator?: (typeof ServerQueryOperators)[number];
};
export type ServerQueryParamsJoinMatchObject<Field extends object = {
    [key: string]: any;
}> = {
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
export type ServerQueryParamsJoinMatchSourceTargetObject = {
    tableName: string;
    fieldName: string;
};
export type ApiConnectBody = {
    url: string;
    key: string;
    database: BUN_SQLITE_MYSQL_user_databases_Type;
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
    type: "pull" | "push";
    user_id?: string | number;
};
export type SuUserType = {
    email: string;
    password: string;
    authKey: string;
    logged_in_status: boolean;
    date: number;
};
export type MariadbRemoteServerObject = {
    host: string;
    port: number;
    primary?: boolean;
    loadBalanced?: boolean;
    users?: MariadbRemoteServerUserObject[];
};
export type MariadbRemoteServerUserObject = {
    name: string;
    password: string;
    host: string;
};
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
export type APICreateUserFunctionParams = {
    encryptionKey?: string;
    payload: any;
    database: string;
    dsqlUserID?: string | number;
    verify?: boolean;
};
export type APICreateUserFunction = (params: APICreateUserFunctionParams) => Promise<AddUserFunctionReturn>;
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
export type HttpRequestParams<ReqObj extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = RequestOptions & {
    scheme?: "http" | "https";
    body?: ReqObj;
    query?: ReqObj;
    urlEncodedFormBody?: boolean;
};
export type HttpRequestFunction<ReqObj extends {
    [k: string]: any;
} = {
    [k: string]: any;
}, ResObj extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = (param: HttpRequestParams<ReqObj>) => Promise<HttpFunctionResponse<ResObj>>;
export type HttpFunctionResponse<ResObj extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    status: number;
    data?: ResObj;
    error?: string;
    str?: string;
    requestedPath?: string;
};
export type ApiGetQueryObject<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
    query: ServerQueryParam<T>;
    table: string;
    dbFullName?: string;
};
export declare const DataCrudRequestMethods: readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
export declare const DataCrudRequestMethodsLowerCase: readonly ["get", "post", "put", "patch", "delete", "options"];
export type DsqlMethodCrudParam<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = {
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
    sanitize?: ({ data, batchData }: {
        data?: T;
        batchData?: T[];
    }) => T | T[];
    debug?: boolean;
};
export type DsqlCrudTransformDataFunction<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = (params: {
    data: T;
    user?: DATASQUIREL_LoggedInUser;
    existingData?: T;
    reqMethod: (typeof DataCrudRequestMethods)[number];
}) => Promise<T>;
export type DsqlCrudTransformQueryFunction<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = (params: {
    query: DsqlCrudQueryObject<T>;
    user?: DATASQUIREL_LoggedInUser;
    reqMethod: (typeof DataCrudRequestMethods)[number];
}) => Promise<DsqlCrudQueryObject<T>>;
export declare const DsqlCrudActions: readonly ["insert", "update", "delete", "get"];
export type DsqlCrudQueryObject<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}, K extends string = string> = ServerQueryParam<T, K> & {
    query?: ServerQueryQueryObject<T, K>;
};
export type SQLDeleteGeneratorParams<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = {
    tableName: string;
    deleteKeyValues?: SQLDeleteData<T>[];
    deleteKeyValuesOperator?: "AND" | "OR";
    dbFullName?: string;
    data?: any;
};
export type SQLDeleteData<T extends {
    [key: string]: any;
} = {
    [key: string]: any;
}> = {
    key: keyof T;
    value: string | number | null | undefined;
    operator?: (typeof ServerQueryEqualities)[number];
};
export type DsqlCrudParamWhereClause = {
    clause: string;
    params?: string[];
};
export type ErrorCallback = (title: string, error: Error, data?: any) => void;
export interface MariaDBUser {
    Host?: string;
    User?: string;
    Password?: string;
    Select_priv?: string;
    Insert_priv?: string;
    Update_priv?: string;
    Delete_priv?: string;
    Create_priv?: string;
    Drop_priv?: string;
    Reload_priv?: string;
    Shutdown_priv?: string;
    Process_priv?: string;
    File_priv?: string;
    Grant_priv?: string;
    References_priv?: string;
    Index_priv?: string;
    Alter_priv?: string;
    Show_db_priv?: string;
    Super_priv?: string;
    Create_tmp_table_priv?: string;
    Lock_tables_priv?: string;
    Execute_priv?: string;
    Repl_slave_priv?: string;
    Repl_client_priv?: string;
    Create_view_priv?: string;
    Show_view_priv?: string;
    Create_routine_priv?: string;
    Alter_routine_priv?: string;
    Create_user_priv?: string;
    Event_priv?: string;
    Trigger_priv?: string;
    Create_tablespace_priv?: string;
    Delete_history_priv?: string;
    ssl_type?: string;
    ssl_cipher?: string;
    x509_issuer?: string;
    x509_subject?: string;
    max_questions?: number;
    max_updates?: number;
    max_connections?: number;
    max_user_connections?: number;
    plugin?: string;
    authentication_string?: string;
    password_expired?: string;
    is_role?: string;
    default_role?: string;
    max_statement_time?: number;
}
export declare const QueryFields: readonly ["duplicate", "user_id", "delegated_user_id", "db_id", "table_id", "db_slug"];
export type LocalFolderType = {
    name: string;
    isPrivate: boolean;
};
export type ResponseQueryObject = {
    sql?: string;
    params?: (string | number)[];
};
export type APIResponseObject<T extends {
    [k: string]: any;
} = {
    [k: string]: any;
}> = {
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
export declare const DockerComposeServices: readonly ["setup", "cron", "reverse-proxy", "webapp", "websocket", "static", "db", "maxscale", "post-db-setup", "web-app-post-db-setup", "post-replica-db-setup", "db-replica-1", "db-replica-2", "db-cron", "web-app-post-db-setup"];
export type DockerComposeServicesType = {
    [key in (typeof DockerComposeServices)[number]]: DockerComposeServiceWithBuildObject;
};
export type DockerComposeNetworks = {
    [k: string]: {
        driver?: "bridge";
        ipam?: {
            config: DockerComposeNetworkConfigObject[];
        };
        external?: boolean;
    };
};
export type DockerComposeNetworkConfigObject = {
    subnet: string;
    gateway: string;
};
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
export type DockerComposeServiceWithImage = Omit<DockerComposeServiceWithBuildObject, "build"> & {
    image: string;
};
export type DockerComposeServicesBuildObject = {
    context: string;
    dockerfile: string;
};
export type DockerComposeServiceNetworkObject = {
    [k: string]: {
        ipv4_address: string;
    };
};
export type ClonedTableInfo = {
    dbId?: string | number;
    tableId?: string | number;
    keepUpdated?: boolean;
    keepDataUpdated?: boolean;
};
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
export declare const IndexTypes: readonly ["regular", "full_text", "vector"];
export type BUNSQLITEErrorObject = {
    sql?: string;
    sqlValues?: any[];
    error?: string;
};
export interface SQLInsertGenReturn {
    query: string;
    values: (string | number)[];
}
export type SQLInsertGenDataFn = () => {
    placeholder: string;
    value: string | number | Float32Array<ArrayBuffer>;
};
export type SQLInsertGenDataType = {
    [k: string]: string | number | SQLInsertGenDataFn | undefined | null;
};
export type SQLInsertGenParams = {
    data: SQLInsertGenDataType[];
    tableName: string;
    dbFullName?: string;
};
export type BunSQLiteConfig = {
    db_name: string;
    /**
     * The Name of the Database Schema File. Eg `db_schema.ts`. This is
     * relative to `db_dir`, or root dir if `db_dir` is not provided
     */
    db_schema_file_name: string;
    /**
     * The Directory for backups
     */
    db_backup_dir: string;
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
export type BunSQLiteConfigReturn = {
    config: BunSQLiteConfig;
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
};
export declare const DefaultFields: BUN_SQLITE_FieldSchemaType[];

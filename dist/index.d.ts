import DbDelete from "./lib/sqlite/db-delete";
import DbInsert from "./lib/sqlite/db-insert";
import DbSelect from "./lib/sqlite/db-select";
import DbSQL from "./lib/sqlite/db-sql";
import DbUpdate from "./lib/sqlite/db-update";
import grabDbSchema from "./utils/grab-db-schema";
import grabJoinFieldsFromQueryObject from "./utils/grab-join-fields-from-query-object";
declare const BunSQLite: {
    readonly select: typeof DbSelect;
    readonly insert: typeof DbInsert;
    readonly update: typeof DbUpdate;
    readonly delete: typeof DbDelete;
    readonly sql: typeof DbSQL;
    readonly utils: {
        readonly grab_db_schema: typeof grabDbSchema;
        readonly grab_join_fields_from_query_object: typeof grabJoinFieldsFromQueryObject;
    };
};
export default BunSQLite;

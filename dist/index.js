import DbDelete from "./lib/sqlite/db-delete";
import DbInsert from "./lib/sqlite/db-insert";
import DbSelect from "./lib/sqlite/db-select";
import DbSQL from "./lib/sqlite/db-sql";
import DbUpdate from "./lib/sqlite/db-update";
import grabDbSchema from "./utils/grab-db-schema";
import grabJoinFieldsFromQueryObject from "./utils/grab-join-fields-from-query-object";
const BunSQLite = {
    select: DbSelect,
    insert: DbInsert,
    update: DbUpdate,
    delete: DbDelete,
    sql: DbSQL,
    utils: {
        grab_db_schema: grabDbSchema,
        grab_join_fields_from_query_object: grabJoinFieldsFromQueryObject,
    },
};
export default BunSQLite;

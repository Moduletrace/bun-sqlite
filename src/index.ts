import DbDelete from "./lib/sqlite/db-delete";
import DbInsert from "./lib/sqlite/db-insert";
import DbSelect from "./lib/sqlite/db-select";
import DbSQL from "./lib/sqlite/db-sql";
import DbUpdate from "./lib/sqlite/db-update";

const BunSQLite = {
    select: DbSelect,
    insert: DbInsert,
    update: DbUpdate,
    delete: DbDelete,
    sql: DbSQL,
} as const;

export default BunSQLite;

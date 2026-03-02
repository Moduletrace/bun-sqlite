import DbDelete from "./lib/sqlite/db-delete";
import DbInsert from "./lib/sqlite/db-insert";
import DbSelect from "./lib/sqlite/db-select";
import DbSQL from "./lib/sqlite/db-sql";
import DbUpdate from "./lib/sqlite/db-update";
declare const BunSQLite: {
    readonly select: typeof DbSelect;
    readonly insert: typeof DbInsert;
    readonly update: typeof DbUpdate;
    readonly delete: typeof DbDelete;
    readonly sql: typeof DbSQL;
};
export default BunSQLite;

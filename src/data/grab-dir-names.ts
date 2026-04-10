import path from "path";
import type { BunSQLiteConfig } from "../types";

type Params = {
    config?: BunSQLiteConfig;
};

export default function grabDirNames(params?: Params) {
    const ROOT_DIR = process.cwd();
    const BUN_SQLITE_DIR = path.join(ROOT_DIR, ".bun-sqlite");
    const BUN_SQLITE_TEMP_DIR = path.join(BUN_SQLITE_DIR, ".tmp");
    const BUN_SQLITE_TEMP_DB_FILE_PATH = path.join(
        BUN_SQLITE_TEMP_DIR,
        "temp.db",
    );
    const BUN_SQLITE_LIVE_SCHEMA = path.join(
        BUN_SQLITE_DIR,
        "live-schema.json",
    );

    return {
        ROOT_DIR,
        BUN_SQLITE_DIR,
        BUN_SQLITE_TEMP_DIR,
        BUN_SQLITE_LIVE_SCHEMA,
        BUN_SQLITE_TEMP_DB_FILE_PATH,
    };
}

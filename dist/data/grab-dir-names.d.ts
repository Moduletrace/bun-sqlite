import type { BunSQLiteConfig } from "../types";
type Params = {
    config?: BunSQLiteConfig;
};
export default function grabDirNames(params?: Params): {
    ROOT_DIR: string;
    BUN_SQLITE_DIR: string;
    BUN_SQLITE_TEMP_DIR: string;
    BUN_SQLITE_LIVE_SCHEMA: string;
};
export {};

import type { BUN_SQLITE_DatabaseSchemaType, BunSQLiteConfig } from "../../types";
type Params = {
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
    config: BunSQLiteConfig;
};
export default function dbSchemaToType({ config, dbSchema, }: Params): string[] | undefined;
export {};

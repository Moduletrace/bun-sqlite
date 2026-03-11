import type { BUN_SQLITE_DatabaseSchemaType, BunSQLiteConfig } from "../../types";
type Params = {
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
    dst_file: string;
    config: BunSQLiteConfig;
};
export default function dbSchemaToTypeDef({ dbSchema, dst_file, config, }: Params): void;
export {};

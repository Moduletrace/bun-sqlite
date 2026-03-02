import type { BUN_SQLITE_DatabaseSchemaType } from "../../types";
type Params = {
    dbSchema?: BUN_SQLITE_DatabaseSchemaType;
};
export default function dbSchemaToType(params?: Params): string[] | undefined;
export {};

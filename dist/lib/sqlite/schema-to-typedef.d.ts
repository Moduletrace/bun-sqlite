import type { BUN_SQLITE_DatabaseSchemaType } from "../../types";
type Params = {
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
    dst_file: string;
};
export default function dbSchemaToTypeDef({ dbSchema, dst_file }: Params): void;
export {};

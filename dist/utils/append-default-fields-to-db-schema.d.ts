import { type BUN_SQLITE_DatabaseSchemaType } from "../types";
type Params = {
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
};
export default function ({ dbSchema }: Params): BUN_SQLITE_DatabaseSchemaType;
export {};

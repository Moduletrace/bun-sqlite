import type { BUN_SQLITE_DatabaseSchemaType } from "../types";
type Params = {
    schema: BUN_SQLITE_DatabaseSchemaType;
};
export declare function writeLiveSchema({ schema }: Params): void;
export declare function readLiveSchema(): BUN_SQLITE_DatabaseSchemaType | undefined;
export {};

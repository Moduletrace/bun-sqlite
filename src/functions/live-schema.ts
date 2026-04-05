import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import grabDirNames from "../data/grab-dir-names";
import type { BUN_SQLITE_DatabaseSchemaType } from "../types";
import path from "path";

const { BUN_SQLITE_LIVE_SCHEMA } = grabDirNames();

type Params = {
    schema: BUN_SQLITE_DatabaseSchemaType;
};

export function writeLiveSchema({ schema }: Params) {
    mkdirSync(path.dirname(BUN_SQLITE_LIVE_SCHEMA), { recursive: true });
    writeFileSync(BUN_SQLITE_LIVE_SCHEMA, JSON.stringify(schema));
}

export function readLiveSchema() {
    if (!existsSync(BUN_SQLITE_LIVE_SCHEMA)) {
        return undefined;
    }

    const live_schema = readFileSync(BUN_SQLITE_LIVE_SCHEMA, "utf-8");
    return JSON.parse(live_schema) as BUN_SQLITE_DatabaseSchemaType;
}

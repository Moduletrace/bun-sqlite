import path from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import type { BUN_SQLITE_DatabaseSchemaType } from "../../types";
import dbSchemaToType from "./db-schema-to-typedef";

type Params = {
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
    dst_file: string;
};

export default function dbSchemaToTypeDef({ dbSchema, dst_file }: Params) {
    try {
        if (!dbSchema) throw new Error("No schema found");

        const definitions = dbSchemaToType({ dbSchema });

        const ourfileDir = path.dirname(dst_file);

        if (!existsSync(ourfileDir)) {
            mkdirSync(ourfileDir, { recursive: true });
        }

        writeFileSync(dst_file, definitions?.join("\n\n") || "", "utf-8");
    } catch (error: any) {
        console.log(`Schema to Typedef Error =>`, error.message);
    }
}

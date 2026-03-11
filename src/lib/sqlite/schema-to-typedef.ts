import path from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import type {
    BUN_SQLITE_DatabaseSchemaType,
    BunSQLiteConfig,
} from "../../types";
import dbSchemaToType from "./db-schema-to-typedef";

type Params = {
    dbSchema: BUN_SQLITE_DatabaseSchemaType;
    dst_file: string;
    config: BunSQLiteConfig;
};

export default function dbSchemaToTypeDef({
    dbSchema,
    dst_file,
    config,
}: Params) {
    try {
        if (!dbSchema) throw new Error("No schema found");

        const definitions = dbSchemaToType({ dbSchema, config });

        const ourfileDir = path.dirname(dst_file);

        if (!existsSync(ourfileDir)) {
            mkdirSync(ourfileDir, { recursive: true });
        }

        writeFileSync(dst_file, definitions?.join("\n\n") || "", "utf-8");
    } catch (error: any) {
        console.log(`Schema to Typedef Error =>`, error.message);
    }
}

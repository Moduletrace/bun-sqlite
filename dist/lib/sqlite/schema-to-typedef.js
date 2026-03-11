import path from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import dbSchemaToType from "./db-schema-to-typedef";
export default function dbSchemaToTypeDef({ dbSchema, dst_file, config, }) {
    try {
        if (!dbSchema)
            throw new Error("No schema found");
        const definitions = dbSchemaToType({ dbSchema, config });
        const ourfileDir = path.dirname(dst_file);
        if (!existsSync(ourfileDir)) {
            mkdirSync(ourfileDir, { recursive: true });
        }
        writeFileSync(dst_file, definitions?.join("\n\n") || "", "utf-8");
    }
    catch (error) {
        console.log(`Schema to Typedef Error =>`, error.message);
    }
}

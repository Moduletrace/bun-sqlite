import type { DSQL_DatabaseSchemaType } from "@moduletrace/datasquirel/dist/package-shared/types";
import dbSchemaToType from "./db-schema-to-type";
import path from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

type Params = {
    dbSchema: DSQL_DatabaseSchemaType;
};

export default function dbSchemaToTypeDef({ dbSchema }: Params) {
    try {
        if (!dbSchema) throw new Error("No schema found");

        const definitions = dbSchemaToType({ dbSchema });

        const finalOutfile = path.resolve(__dirname, "../types/db/index.ts");

        const ourfileDir = path.dirname(finalOutfile);

        if (!existsSync(ourfileDir)) {
            mkdirSync(ourfileDir, { recursive: true });
        }

        writeFileSync(finalOutfile, definitions?.join("\n\n") || "", "utf-8");
    } catch (error: any) {
        console.log(`Schema to Typedef Error =>`, error.message);
    }
}

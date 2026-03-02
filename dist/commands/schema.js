import { Command } from "commander";
import { SQLiteSchemaManager } from "../lib/sqlite/db-schema-manager";
import init from "../functions/init";
import grabDirNames from "../data/grab-dir-names";
import path from "path";
import dbSchemaToTypeDef from "../lib/sqlite/schema-to-typedef";
import _ from "lodash";
import { DefaultFields } from "../types";
import appendDefaultFieldsToDbSchema from "../utils/append-default-fields-to-db-schema";
import chalk from "chalk";
export default function () {
    return new Command("schema")
        .description("Build DB From Schema")
        .option("-v, --vector", "Recreate Vector Tables. This will drop and rebuild all vector tables")
        .option("-t, --typedef", "Generate typescript type definitions")
        .action(async (opts) => {
        console.log(`Starting process ...`);
        const { config, dbSchema } = await init();
        const { ROOT_DIR } = grabDirNames();
        const isVector = Boolean(opts.vector || opts.v);
        const isTypeDef = Boolean(opts.typedef || opts.t);
        const finaldbSchema = appendDefaultFieldsToDbSchema({ dbSchema });
        const manager = new SQLiteSchemaManager({
            schema: finaldbSchema,
            recreate_vector_table: isVector,
        });
        await manager.syncSchema();
        manager.close();
        if (isTypeDef && config.typedef_file_path) {
            const out_file = path.resolve(ROOT_DIR, config.typedef_file_path);
            dbSchemaToTypeDef({
                dbSchema: finaldbSchema,
                dst_file: out_file,
            });
        }
        console.log(`${chalk.bold(chalk.green(`DB Schema setup success!`))}`);
        process.exit();
    });
}

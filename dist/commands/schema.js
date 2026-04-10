import { Command } from "commander";
import { SQLiteSchemaManager } from "../lib/sqlite/db-schema-manager";
import init from "../functions/init";
import grabDirNames from "../data/grab-dir-names";
import path from "path";
import dbSchemaToTypeDef from "../lib/sqlite/schema-to-typedef";
import _ from "lodash";
import appendDefaultFieldsToDbSchema from "../utils/append-default-fields-to-db-schema";
import chalk from "chalk";
import { writeLiveSchema } from "../functions/live-schema";
import grabDBDir from "../utils/grab-db-dir";
import { cpSync } from "fs";
export default function () {
    return new Command("schema")
        .description("Build DB From Schema")
        .option("-v, --vector", "Recreate Vector Tables. This will drop and rebuild all vector tables")
        .option("-t, --typedef", "Generate typescript type definitions")
        .action(async (opts) => {
        console.log(`Starting process ...`);
        const { config, dbSchema } = await init();
        const { ROOT_DIR, BUN_SQLITE_TEMP_DB_FILE_PATH } = grabDirNames();
        const { db_file_path } = grabDBDir({ config });
        cpSync(db_file_path, BUN_SQLITE_TEMP_DB_FILE_PATH);
        try {
            const isVector = Boolean(opts.vector || opts.v);
            const isTypeDef = Boolean(opts.typedef || opts.t);
            const finaldbSchema = appendDefaultFieldsToDbSchema({
                dbSchema,
            });
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
                    config,
                });
            }
            writeLiveSchema({ schema: finaldbSchema });
            console.log(`${chalk.bold(chalk.green(`DB Schema setup success!`))}`);
            process.exit();
        }
        catch (error) {
            console.log(error);
            cpSync(BUN_SQLITE_TEMP_DB_FILE_PATH, db_file_path);
            process.exit(1);
        }
    });
}

import { Command } from "commander";
import init from "../functions/init";
import dbSchemaToTypeDef from "../lib/sqlite/schema-to-typedef";
import path from "path";
import grabDirNames from "../data/grab-dir-names";
import appendDefaultFieldsToDbSchema from "../utils/append-default-fields-to-db-schema";
import chalk from "chalk";

export default function () {
    return new Command("typedef")
        .description("Build DB From Schema")
        .action(async (opts) => {
            console.log(`Creating Type Definition From DB Schema ...`);

            const { config, dbSchema } = await init();
            const { ROOT_DIR } = grabDirNames();

            const finaldbSchema = appendDefaultFieldsToDbSchema({ dbSchema });

            if (config.typedef_file_path) {
                const out_file = path.resolve(
                    ROOT_DIR,
                    config.typedef_file_path,
                );
                dbSchemaToTypeDef({
                    dbSchema: finaldbSchema,
                    dst_file: out_file,
                    config,
                });
            } else {
                console.error(``);
                process.exit(1);
            }

            console.log(`${chalk.bold(chalk.green(`Typedef gen success!`))}`);

            process.exit();
        });
}

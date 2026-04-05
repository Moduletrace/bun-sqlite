import { Command } from "commander";
import init from "../../functions/init";
import grabDBDir from "../../utils/grab-db-dir";
import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { Database } from "bun:sqlite";
import listTables from "./list-tables";
import runSQL from "./run-sql";
import * as sqliteVec from "sqlite-vec";

export default function () {
    return new Command("admin")
        .description("View Tables and Data, Run SQL Queries, Etc.")
        .action(async () => {
            const { config } = await init();
            const { db_file_path } = grabDBDir({ config });
            const db = new Database(db_file_path);

            sqliteVec.load(db);

            console.log(chalk.bold(chalk.blue("\nBun SQLite Admin\n")));

            try {
                while (true) {
                    const paradigm = await select({
                        message: "Choose an action:",
                        choices: [
                            { name: "Tables", value: "list_tables" },
                            { name: "SQL", value: "run_sql" },
                            { name: chalk.dim("✕ Exit"), value: "exit" },
                        ],
                    });

                    if (paradigm === "exit") break;
                    if (paradigm === "list_tables") {
                        const result = await listTables({ db });
                        if (result === "__exit__") break;
                    }
                    if (paradigm === "run_sql") await runSQL({ db });
                }
            } catch (error: any) {
                console.error(error.message);
            }

            db.close();
            process.exit();
        });
}

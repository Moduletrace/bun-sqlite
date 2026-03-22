import { Database } from "bun:sqlite";
import { input } from "@inquirer/prompts";
import chalk from "chalk";

type Params = { db: Database };

export default async function runSQL({ db }: Params) {
    const sql = await input({
        message: "Enter SQL query:",
        validate: (val) => val.trim().length > 0 || "Query cannot be empty",
    });

    try {
        const isSelect = /^select/i.test(sql.trim());

        if (isSelect) {
            const rows = db.query(sql).all();
            console.log(
                `\n${chalk.bold(`Result (${rows.length} row${rows.length !== 1 ? "s" : ""}):`)} \n`,
            );
            if (rows.length) console.table(rows);
            else console.log(chalk.yellow("No rows returned.\n"));
        } else {
            const result = db.run(sql);
            console.log(
                chalk.green(
                    `\nSuccess! Affected rows: ${result.changes}, Last insert ID: ${result.lastInsertRowid}\n`,
                ),
            );
        }
    } catch (error: any) {
        console.error(chalk.red(`\nSQL Error: ${error.message}\n`));
    }
}

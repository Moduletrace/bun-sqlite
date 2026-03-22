import { Database } from "bun:sqlite";
import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { AppData } from "../../data/app-data";
import showEntries from "./show-entries";

type Params = { db: Database };

type ColumnInfo = {
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: string | null;
    pk: number;
};

export default async function listTables({ db }: Params) {
    const tables = db
        .query<{ table_name: string }, []>(
            `SELECT table_name FROM ${AppData["DbSchemaManagerTableName"]}`,
        )
        .all();

    if (!tables.length) {
        console.log(chalk.yellow("\nNo tables found.\n"));
        return;
    }

    // Level 1: table selection loop
    while (true) {
        const tableName = await select({
            message: "Select a table:",
            choices: [
                ...tables.map((t) => ({ name: t.table_name, value: t.table_name })),
                { name: chalk.dim("← Go Back"), value: "__back__" },
            ],
        });

        if (tableName === "__back__") break;

        // Level 2: action loop — stays here until "Go Back"
        while (true) {
            const action = await select({
                message: `"${tableName}" — choose an action:`,
                choices: [
                    { name: "Show Entries", value: "entries" },
                    { name: "Show Schema", value: "schema" },
                    { name: chalk.dim("← Go Back"), value: "__back__" },
                ],
            });

            if (action === "__back__") break;

            if (action === "entries") {
                await showEntries({ db, tableName });
            }

            if (action === "schema") {
                const columns = db
                    .query<ColumnInfo, []>(`PRAGMA table_info("${tableName}")`)
                    .all();

                console.log(`\n${chalk.bold(`Schema for "${tableName}":`)} \n`);
                console.table(
                    columns.map((c) => ({
                        "#": c.cid,
                        Name: c.name,
                        Type: c.type,
                        "Not Null": c.notnull ? "YES" : "NO",
                        Default: c.dflt_value ?? "(none)",
                        "Primary Key": c.pk ? "YES" : "NO",
                    })),
                );
                console.log();
            }
        }
    }
}

import { Database } from "bun:sqlite";
import chalk from "chalk";
import { select } from "@inquirer/prompts";

type Params = { db: Database; tableName: string };

type ColumnInfo = {
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: string | null;
    pk: number;
};

type IndexInfo = { name: string; unique: number; origin: string };
type IndexColumn = { name: string };
type ForeignKey = { id: number; from: string; table: string; to: string; on_update: string; on_delete: string };

export default async function showFields({ db, tableName }: Params): Promise<"__exit__" | void> {
    const columns = db.query<ColumnInfo, []>(`PRAGMA table_info("${tableName}")`).all();
    const indexes = db.query<IndexInfo, []>(`PRAGMA index_list("${tableName}")`).all();
    const foreignKeys = db.query<ForeignKey, []>(`PRAGMA foreign_key_list("${tableName}")`).all();

    const indexedFields = new Map<string, { unique: boolean }>();
    for (const idx of indexes) {
        const cols = db.query<IndexColumn, []>(`PRAGMA index_info("${idx.name}")`).all();
        for (const col of cols) {
            indexedFields.set(col.name, { unique: idx.unique === 1 });
        }
    }

    while (true) {
        const fieldName = await select({
            message: `"${tableName}" — select a field:`,
            choices: [
                ...columns.map((c) => ({ name: c.name, value: c.name })),
                { name: chalk.dim("← Go Back"), value: "__back__" },
                { name: chalk.dim("✕ Exit"), value: "__exit__" },
            ],
        });

        if (fieldName === "__back__") break;
        if (fieldName === "__exit__") return "__exit__";

        const col = columns.find((c) => c.name === fieldName)!;
        const idx = indexedFields.get(fieldName);
        const fk = foreignKeys.find((f) => f.from === fieldName);

        console.log(`\n${chalk.bold(`Field: "${fieldName}"`)}\n`);
        console.log(`  ${chalk.dim("Table")}        ${tableName}`);
        console.log(`  ${chalk.dim("Column #")}     ${col.cid}`);
        console.log(`  ${chalk.dim("Type")}         ${col.type || chalk.italic("(none)")}`);
        console.log(`  ${chalk.dim("Primary Key")}  ${col.pk ? chalk.green("YES") : "NO"}`);
        console.log(`  ${chalk.dim("Not Null")}     ${col.notnull ? chalk.yellow("YES") : "NO"}`);
        console.log(`  ${chalk.dim("Default")}      ${col.dflt_value ?? chalk.italic("(none)")}`);
        console.log(`  ${chalk.dim("Indexed")}      ${idx ? chalk.cyan("YES") : "NO"}`);
        console.log(`  ${chalk.dim("Unique")}       ${idx?.unique ? chalk.cyan("YES") : "NO"}`);
        if (fk) {
            console.log(`  ${chalk.dim("Foreign Key")}  ${chalk.magenta(`${fk.table}(${fk.to})`)}`);
            console.log(`  ${chalk.dim("On Update")}    ${fk.on_update}`);
            console.log(`  ${chalk.dim("On Delete")}    ${fk.on_delete}`);
        } else {
            console.log(`  ${chalk.dim("Foreign Key")}  NO`);
        }
        console.log();
    }
}

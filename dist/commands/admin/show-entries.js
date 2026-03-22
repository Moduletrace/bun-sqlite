import { Database } from "bun:sqlite";
import chalk from "chalk";
import { select, input } from "@inquirer/prompts";
const LIMIT = 50;
export default async function showEntries({ db, tableName }) {
    let page = 0;
    let searchField = null;
    let searchTerm = null;
    while (true) {
        const offset = page * LIMIT;
        const rows = searchTerm
            ? db
                .query(`SELECT * FROM "${tableName}" WHERE "${searchField}" LIKE ? LIMIT ${LIMIT} OFFSET ${offset}`)
                .all(`%${searchTerm}%`)
            : db
                .query(`SELECT * FROM "${tableName}" LIMIT ${LIMIT} OFFSET ${offset}`)
                .all();
        const countRow = (searchTerm
            ? db
                .query(`SELECT COUNT(*) as count FROM "${tableName}" WHERE "${searchField}" LIKE ?`)
                .get(`%${searchTerm}%`)
            : db.query(`SELECT COUNT(*) as count FROM "${tableName}"`).get());
        const total = countRow.count;
        const searchInfo = searchTerm
            ? chalk.dim(` · searching "${searchField}" = "${searchTerm}"`)
            : "";
        console.log(`\n${chalk.bold(tableName)} — Page ${page + 1}${searchInfo} (${rows.length} of ${total}):\n`);
        if (rows.length) {
            console.log(rows);
            // if (rows.length) console.table(rows);
        }
        else {
            console.log(chalk.yellow("No rows found."));
            console.log();
        }
        const choices = [];
        if (page > 0)
            choices.push({ name: "← Previous Page", value: "prev" });
        if (offset + rows.length < total)
            choices.push({ name: "Next Page →", value: "next" });
        choices.push({ name: "Search by Field", value: "search" });
        if (searchTerm)
            choices.push({ name: "Clear Search", value: "clear_search" });
        choices.push({ name: chalk.dim("← Go Back"), value: "__back__" });
        choices.push({ name: chalk.dim("✕ Exit"), value: "__exit__" });
        const action = await select({ message: "Navigate:", choices });
        if (action === "__back__")
            break;
        if (action === "__exit__")
            return "__exit__";
        if (action === "next")
            page++;
        if (action === "prev")
            page--;
        if (action === "clear_search") {
            searchField = null;
            searchTerm = null;
            page = 0;
        }
        if (action === "search") {
            const columns = db
                .query(`PRAGMA table_info("${tableName}")`)
                .all();
            searchField = await select({
                message: "Search by field:",
                choices: columns.map((c) => ({ name: c.name, value: c.name })),
            });
            searchTerm = await input({
                message: `Search term for "${searchField}":`,
                validate: (v) => v.trim().length > 0 || "Cannot be empty",
            });
            page = 0;
        }
    }
}

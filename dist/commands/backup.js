import { Command } from "commander";
import init from "../functions/init";
import path from "path";
import grabDBDir from "../utils/grab-db-dir";
import fs from "fs";
import grabDBBackupFileName from "../utils/grab-db-backup-file-name";
import chalk from "chalk";
import trimBackups from "../utils/trim-backups";
export default function () {
    return new Command("backup")
        .description("Backup Database")
        .action(async (opts) => {
        console.log(`Backing up database ...`);
        const { config } = await init();
        const { backup_dir, db_file_path } = grabDBDir({ config });
        const new_db_file_name = grabDBBackupFileName({ config });
        fs.cpSync(db_file_path, path.join(backup_dir, new_db_file_name));
        trimBackups({ config });
        console.log(`${chalk.bold(chalk.green(`DB Backup Success!`))}`);
        process.exit();
    });
}

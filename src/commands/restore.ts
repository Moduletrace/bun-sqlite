import { Command } from "commander";
import init from "../functions/init";
import grabDBDir from "../utils/grab-db-dir";
import fs from "fs";
import chalk from "chalk";
import grabSortedBackups from "../utils/grab-sorted-backups";
import { select } from "@inquirer/prompts";
import grabBackupData from "../utils/grab-backup-data";
import path from "path";

export default function () {
    return new Command("restore")
        .description("Restore Database")
        .action(async (opts) => {
            console.log(`Restoring up database ...`);

            const { config } = await init();

            const { backup_dir, db_file_path } = grabDBDir({ config });

            const backups = grabSortedBackups({ config });

            if (!backups?.[0]) {
                console.error(
                    `No Backups to restore. Use the \`backup\` command to create a backup`,
                );
                process.exit(1);
            }

            try {
                const selected_backup = await select({
                    message: "Select a backup:",
                    choices: backups.map((b, i) => {
                        const { backup_date } = grabBackupData({
                            backup_name: b,
                        });
                        return {
                            name: `Backup #${i + 1}: ${backup_date.toDateString()} ${backup_date.getHours()}:${backup_date.getMinutes()}:${backup_date.getSeconds().toString().padStart(2, "0")}`,
                            value: b,
                        };
                    }),
                });

                fs.cpSync(path.join(backup_dir, selected_backup), db_file_path);

                console.log(
                    `${chalk.bold(chalk.green(`DB Restore Success!`))}`,
                );

                process.exit();
            } catch (error: any) {
                console.error(`Backup Restore ERROR => ${error.message}`);
                process.exit();
            }
        });
}

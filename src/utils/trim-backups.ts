import grabDBDir from "../utils/grab-db-dir";
import fs from "fs";
import type { BunSQLiteConfig } from "../types";
import grabSortedBackups from "./grab-sorted-backups";
import { AppData } from "../data/app-data";
import path from "path";

type Params = {
    config: BunSQLiteConfig;
};

export default function trimBackups({ config }: Params) {
    const { backup_dir } = grabDBDir({ config });

    const backups = grabSortedBackups({ config });

    const max_backups = config.max_backups || AppData["MaxBackups"];

    for (let i = 0; i < backups.length; i++) {
        const backup_name = backups[i];
        if (!backup_name) continue;
        if (i > max_backups - 1) {
            const backup_file_to_unlink = path.join(backup_dir, backup_name);
            fs.unlinkSync(backup_file_to_unlink);
        }
    }
}

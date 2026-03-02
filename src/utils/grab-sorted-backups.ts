import grabDBDir from "../utils/grab-db-dir";
import fs from "fs";
import type { BunSQLiteConfig } from "../types";

type Params = {
    config: BunSQLiteConfig;
};

export default function grabSortedBackups({ config }: Params) {
    const { backup_dir } = grabDBDir({ config });

    const backups = fs.readdirSync(backup_dir);

    /**
     * Order Backups. Most recent first.
     */
    const ordered_backups = backups.sort((a, b) => {
        const a_date = Number(a.split("-").pop());
        const b_date = Number(b.split("-").pop());

        if (a_date > b_date) {
            return -1;
        }

        return 1;
    });

    return ordered_backups;
}

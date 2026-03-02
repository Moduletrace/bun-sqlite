import path from "path";
import grabDirNames from "../data/grab-dir-names";
import type { BunSQLiteConfig } from "../types";

type Params = {
    config: BunSQLiteConfig;
};

export default function grabDBDir({ config }: Params) {
    const { ROOT_DIR } = grabDirNames();

    let db_dir = ROOT_DIR;

    if (config.db_dir) {
        db_dir = config.db_dir;
    }

    const backup_dir = path.resolve(db_dir, config.db_backup_dir);
    const db_file_path = path.resolve(db_dir, config.db_name);

    return { db_dir, backup_dir, db_file_path };
}

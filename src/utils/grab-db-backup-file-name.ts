import type { BunSQLiteConfig } from "../types";

type Params = {
    config: BunSQLiteConfig;
};

export default function grabDBBackupFileName({ config }: Params) {
    const new_db_file_name = `${config.db_name}-${Date.now()}`;

    return new_db_file_name;
}

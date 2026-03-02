import type { BunSQLiteConfig } from "../types";
type Params = {
    config: BunSQLiteConfig;
};
export default function grabDBDir({ config }: Params): {
    db_dir: string;
    backup_dir: string;
    db_file_path: string;
};
export {};

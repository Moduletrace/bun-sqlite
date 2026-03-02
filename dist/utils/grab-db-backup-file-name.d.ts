import type { BunSQLiteConfig } from "../types";
type Params = {
    config: BunSQLiteConfig;
};
export default function grabDBBackupFileName({ config }: Params): string;
export {};

import type { BunSQLiteConfig } from "../types";
type Params = {
    config: BunSQLiteConfig;
};
export default function grabSortedBackups({ config }: Params): string[];
export {};

import { Database } from "bun:sqlite";
type Params = {
    db: Database;
    tableName: string;
};
export default function showEntries({ db, tableName }: Params): Promise<void>;
export {};

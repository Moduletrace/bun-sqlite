import { Database } from "bun:sqlite";
type Params = {
    db: Database;
    tableName: string;
};
export default function showFields({ db, tableName }: Params): Promise<"__exit__" | void>;
export {};

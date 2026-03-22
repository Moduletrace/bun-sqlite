import { Database } from "bun:sqlite";
type Params = {
    db: Database;
};
export default function listTables({ db, }: Params): Promise<"__exit__" | void>;
export {};

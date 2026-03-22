import { Database } from "bun:sqlite";
type Params = {
    db: Database;
};
export default function runSQL({ db }: Params): Promise<void>;
export {};

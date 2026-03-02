import { Database } from "bun:sqlite";
import path from "node:path";
import * as sqliteVec from "sqlite-vec";
import grabDirNames from "../../data/grab-dir-names";
import init from "../../functions/init";
const { ROOT_DIR } = grabDirNames();
const { config } = await init();
let db_dir = ROOT_DIR;
if (config.db_dir) {
    db_dir = config.db_dir;
}
const DBFilePath = path.join(db_dir, config.db_name);
const DbClient = new Database(DBFilePath, {
    create: true,
});
sqliteVec.load(DbClient);
export default DbClient;

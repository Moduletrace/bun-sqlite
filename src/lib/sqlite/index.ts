import { Database } from "bun:sqlite";
import * as sqliteVec from "sqlite-vec";
import grabDirNames from "../../data/grab-dir-names";
import init from "../../functions/init";
import grabDBDir from "../../utils/grab-db-dir";

const { ROOT_DIR } = grabDirNames();
const { config } = await init();

let db_dir = ROOT_DIR;

if (config.db_dir) {
    db_dir = config.db_dir;
}

const { db_file_path } = grabDBDir({ config });

const DbClient = new Database(db_file_path, {
    create: true,
});

sqliteVec.load(DbClient);

export default DbClient;

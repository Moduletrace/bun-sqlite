import AppData from "@/data/app-data";
import grabDirNames from "@/utils/grab-dir-names";
import { Database } from "bun:sqlite";
import path from "node:path";
import * as sqliteVec from "sqlite-vec";

const { ROOT_DIR } = grabDirNames();

const DBFilePath = path.join(ROOT_DIR, AppData["DbName"]);
const DBVecPluginFilePath = path.join(ROOT_DIR, AppData["DbVecPluginName"]);

const DbClient = new Database(DBFilePath, {
    create: true,
});

// DbClient.loadExtension(DBVecPluginFilePath);

sqliteVec.load(DbClient);

// Test if it's working
// const { vec_version } = DbClient.prepare(
//     "select vec_version() as vec_version",
// ).get();
// console.log(`sqlite-vec version: ${vec_version}`);

export default DbClient;

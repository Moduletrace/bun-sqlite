import path from "path";
import fs from "fs";
import { AppData } from "../data/app-data";
import grabDirNames from "../data/grab-dir-names";
import type {
    BunSQLiteConfig,
    BunSQLiteConfigReturn,
    BUN_SQLITE_DatabaseSchemaType,
} from "../types";

export default async function init(): Promise<BunSQLiteConfigReturn> {
    try {
        const { ROOT_DIR } = grabDirNames();
        const { ConfigFileName } = AppData;

        const ConfigFilePath = path.join(ROOT_DIR, ConfigFileName);

        if (!fs.existsSync(ConfigFilePath)) {
            console.log("ConfigFilePath", ConfigFilePath);

            console.error(
                `Please create a \`${ConfigFileName}\` file at the root of your project.`,
            );
            process.exit(1);
        }

        const ConfigImport = await import(ConfigFilePath);
        const Config = ConfigImport["default"] as BunSQLiteConfig;

        if (!Config.db_name) {
            console.error(`\`db_name\` is required in your config`);
            process.exit(1);
        }

        if (!Config.db_schema_file_name) {
            console.error(`\`db_schema_file_name\` is required in your config`);
            process.exit(1);
        }

        if (!Config.db_backup_dir) {
            console.error(`\`db_backup_dir\` is required in your config`);
            process.exit(1);
        }

        let db_dir = ROOT_DIR;

        if (Config.db_dir) {
            db_dir = path.resolve(ROOT_DIR, Config.db_dir);

            if (!fs.existsSync(Config.db_dir)) {
                fs.mkdirSync(Config.db_dir, { recursive: true });
            }
        }

        const DBSchemaFilePath = path.join(db_dir, Config.db_schema_file_name);
        const DbSchemaImport = await import(DBSchemaFilePath);
        const DbSchema = DbSchemaImport[
            "default"
        ] as BUN_SQLITE_DatabaseSchemaType;

        const BackupDir = path.resolve(db_dir, Config.db_backup_dir);
        if (!fs.existsSync(BackupDir)) {
            fs.mkdirSync(BackupDir, { recursive: true });
        }

        return { config: Config, dbSchema: DbSchema };
    } catch (error: any) {
        console.error(`Initialization ERROR => ` + error.message);
        process.exit(1);
    }
}

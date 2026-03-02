export default function grabDBBackupFileName({ config }) {
    const new_db_file_name = `${config.db_name}-${Date.now()}`;
    return new_db_file_name;
}

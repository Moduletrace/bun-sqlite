export default function grabBackupData({ backup_name }) {
    const backup_parts = backup_name.split("-");
    const backup_date_timestamp = Number(backup_parts.pop());
    const origin_backup_name = backup_parts.join("-");
    const backup_date = new Date(backup_date_timestamp);
    return { backup_date, backup_date_timestamp, origin_backup_name };
}

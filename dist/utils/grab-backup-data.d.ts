type Params = {
    backup_name: string;
};
export default function grabBackupData({ backup_name }: Params): {
    backup_date: Date;
    backup_date_timestamp: number;
    origin_backup_name: string;
};
export {};

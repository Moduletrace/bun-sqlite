type Params = {
    sql: string;
    table: string;
    data: any[];
};
export default function ({ sql: passed_sql, table, data }: Params): Promise<string>;
export {};

import type { BUN_SQLITE_TableSchemaType } from "../../types";
type Param = {
    paradigm: "JavaScript" | "TypeScript" | undefined;
    table: BUN_SQLITE_TableSchemaType;
    query?: any;
    typeDefName?: string;
    allValuesOptional?: boolean;
    addExport?: boolean;
    dbName?: string;
};
export default function generateTypeDefinition({ paradigm, table, query, typeDefName, allValuesOptional, addExport, dbName, }: Param): {
    typeDefinition: string | null;
    tdName: string;
};
export {};

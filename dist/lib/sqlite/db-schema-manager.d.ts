#!/usr/bin/env bun
import type { BUN_SQLITE_DatabaseSchemaType } from "../../types";
declare class SQLiteSchemaManager {
    private db;
    private db_manager_table_name;
    private recreate_vector_table;
    private db_schema;
    constructor({ schema, recreate_vector_table, }: {
        schema: BUN_SQLITE_DatabaseSchemaType;
        recreate_vector_table?: boolean;
    });
    private createDbManagerTable;
    private insertDbManagerTable;
    private removeDbManagerTable;
    /**
     * Main synchronization method
     */
    syncSchema(): Promise<void>;
    /**
     * Get list of existing tables in the database
     */
    private getExistingTables;
    /**
     * Drop tables that are no longer in the schema
     */
    private dropRemovedTables;
    /**
     * Sync a single table (create or update)
     */
    private syncTable;
    /**
     * Create a new table
     */
    private createTable;
    /**
     * Update an existing table
     */
    private updateTable;
    /**
     * Get existing columns for a table
     */
    private getTableColumns;
    /**
     * Add a new column to existing table
     */
    private addColumn;
    /**
     * Recreate table (for complex schema changes)
     */
    private recreateTable;
    /**
     * Build column definition SQL
     */
    private buildColumnDefinition;
    /**
     * Map DSQL data types to SQLite types
     */
    private mapDataType;
    /**
     * Build foreign key constraint
     */
    private buildForeignKeyConstraint;
    /**
     * Sync indexes for a table
     */
    private syncIndexes;
    /**
     * Close database connection
     */
    close(): void;
}
export { SQLiteSchemaManager };

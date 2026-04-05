#!/usr/bin/env bun
import { Database } from "bun:sqlite";
import _ from "lodash";
import DbClient from ".";
import { AppData } from "../../data/app-data";
// Schema Manager Class
class SQLiteSchemaManager {
    db;
    db_manager_table_name;
    recreate_vector_table;
    db_schema;
    constructor({ schema, recreate_vector_table = false, }) {
        this.db = DbClient;
        this.db_manager_table_name = AppData["DbSchemaManagerTableName"];
        this.db.run("PRAGMA foreign_keys = ON;");
        this.recreate_vector_table = recreate_vector_table;
        this.createDbManagerTable();
        this.db_schema = schema;
    }
    createDbManagerTable() {
        this.db.run(`
            CREATE TABLE IF NOT EXISTS ${this.db_manager_table_name} (
                table_name TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `);
    }
    insertDbManagerTable(tableName) {
        this.db.run(`INSERT INTO ${this.db_manager_table_name} (table_name,created_at,updated_at) VALUES (?, ?, ?)`, [tableName, Date.now(), Date.now()]);
    }
    removeDbManagerTable(tableName) {
        this.db.run(`DELETE FROM ${this.db_manager_table_name} WHERE table_name = ?`, [tableName]);
    }
    /**
     * Main synchronization method
     */
    async syncSchema() {
        console.log("Starting schema synchronization...");
        const existingTables = this.getExistingTables();
        const schemaTables = this.db_schema.tables.map((t) => t.tableName);
        // 2. Create or update tables
        for (const table of this.db_schema.tables) {
            await this.syncTable(table, existingTables);
        }
        // 1. Drop tables that no longer exist in schema
        await this.dropRemovedTables(existingTables, schemaTables);
        console.log("Schema synchronization complete!");
    }
    /**
     * Get list of existing tables in the database
     */
    getExistingTables() {
        let sql = `SELECT table_name FROM ${this.db_manager_table_name}`;
        const query = this.db.query(sql);
        const results = query.all();
        return results.map((r) => r.table_name);
    }
    /**
     * Drop tables that are no longer in the schema
     */
    async dropRemovedTables(existingTables, schemaTables) {
        const tablesToDrop = existingTables.filter((t) => !schemaTables.includes(t) &&
            !schemaTables.find((scT) => t.startsWith(scT + "_")));
        for (const tableName of tablesToDrop) {
            console.log(`Dropping table: ${tableName}`);
            this.db.run(`DROP TABLE IF EXISTS "${tableName}"`);
            this.db.run(`DELETE FROM ${this.db_manager_table_name} WHERE table_name = "${tableName}"`);
        }
    }
    /**
     * Sync a single table (create or update)
     */
    async syncTable(table, existingTables) {
        let tableExists = existingTables.includes(table.tableName);
        // Handle table rename
        if (table.tableNameOld && table.tableNameOld !== table.tableName) {
            if (existingTables.includes(table.tableNameOld)) {
                console.log(`Renaming table: ${table.tableNameOld} -> ${table.tableName}`);
                this.db.run(`ALTER TABLE "${table.tableNameOld}" RENAME TO "${table.tableName}"`);
                this.insertDbManagerTable(table.tableName);
                this.removeDbManagerTable(table.tableNameOld);
                tableExists = true;
            }
        }
        if (!tableExists) {
            // Create new table
            await this.createTable(table);
            this.insertDbManagerTable(table.tableName);
        }
        else if (!table.isVector) {
            // Update existing table
            await this.updateTable(table);
        }
        else {
            return;
        }
        // Sync indexes
        await this.syncIndexes(table);
    }
    /**
     * Create a new table
     */
    async createTable(table) {
        if (!table.tableName.match(/_temp_\d+$/)) {
            console.log(`Creating table: ${table.tableName}`);
        }
        let new_table = _.cloneDeep(table);
        if (new_table.parentTableName) {
            const parent_table = this.db_schema.tables.find((t) => t.tableName === new_table.parentTableName);
            if (!parent_table) {
                throw new Error(`Parent table \`${new_table.parentTableName}\` not found for \`${new_table.tableName}\``);
            }
            new_table = _.merge(parent_table, {
                tableName: new_table.tableName,
                tableDescription: new_table.tableDescription,
            });
        }
        const columns = [];
        const foreignKeys = [];
        for (const field of new_table.fields) {
            const columnDef = this.buildColumnDefinition(field);
            columns.push(columnDef);
            if (field.foreignKey) {
                foreignKeys.push(this.buildForeignKeyConstraint(field));
            }
        }
        // Add unique constraints
        if (new_table.uniqueConstraints) {
            for (const constraint of new_table.uniqueConstraints) {
                if (constraint.constraintTableFields &&
                    constraint.constraintTableFields.length > 0) {
                    const fields = constraint.constraintTableFields
                        .map((f) => `"${f.value}"`)
                        .join(", ");
                    const constraintName = constraint.constraintName ||
                        `unique_${fields.replace(/"/g, "")}`;
                    columns.push(`CONSTRAINT "${constraintName}" UNIQUE (${fields})`);
                }
            }
        }
        const allConstraints = [...columns, ...foreignKeys];
        const sql = new_table.isVector
            ? `CREATE VIRTUAL TABLE "${new_table.tableName}" USING ${new_table.vectorType || "vec0"}(${allConstraints.join(", ")})`
            : `CREATE TABLE "${new_table.tableName}" (${allConstraints.join(", ")})`;
        this.db.run(sql);
    }
    /**
     * Update an existing table
     */
    async updateTable(table) {
        console.log(`Updating table: ${table.tableName}`);
        // const existingColumns = this.getTableColumns(table.tableName);
        // const schemaColumns = table.fields.map((f) => f.fieldName || "");
        // // SQLite has limited ALTER TABLE support
        // // We need to use the recreation strategy for complex changes
        // const columnsToAdd = table.fields.filter(
        //     (f) =>
        //         f.fieldName &&
        //         !existingColumns.find(
        //             (c) =>
        //                 c.name == f.fieldName && c.type == this.mapDataType(f),
        //         ),
        // );
        // // const columnsToRemove = existingColumns.filter(
        // //     (c) => !schemaColumns.includes(c.name),
        // // );
        // // const columnsToUpdate = table.fields.filter(
        // //     (f) =>
        // //         f.fieldName &&
        // //         f.updatedField &&
        // //         existingColumns.find(
        // //             (c) =>
        // //                 c.name == f.fieldName && c.type == this.mapDataType(f),
        // //         ),
        // // );
        // for (const field of columnsToAdd) {
        //     await this.addColumn(table.tableName, field);
        // }
        // // // Simple case: only adding columns
        // // if (columnsToRemove.length === 0 && columnsToUpdate.length === 0) {
        // //     for (const field of columnsToAdd) {
        // //         await this.addColumn(table.tableName, field);
        // //     }
        // // } else {
        // //     // Complex case: need to recreate table
        // // }
        await this.recreateTable(table);
    }
    /**
     * Get existing columns for a table
     */
    getTableColumns(tableName) {
        const query = this.db.query(`PRAGMA table_info("${tableName}")`);
        const results = query.all();
        return results;
    }
    /**
     * Add a new column to existing table
     */
    async addColumn(tableName, field) {
        console.log(`Adding column: ${tableName}.${field.fieldName}`);
        const columnDef = this.buildColumnDefinition(field);
        // Remove PRIMARY KEY and UNIQUE constraints for ALTER TABLE ADD COLUMN
        const cleanDef = columnDef
            .replace(/PRIMARY KEY/gi, "")
            .replace(/AUTOINCREMENT/gi, "")
            .replace(/UNIQUE/gi, "")
            .trim();
        const sql = `ALTER TABLE "${tableName}" ADD COLUMN ${cleanDef}`;
        this.db.run(sql);
    }
    /**
     * Recreate table (for complex schema changes)
     */
    async recreateTable(table) {
        if (table.isVector) {
            if (!this.recreate_vector_table) {
                return;
            }
            console.log(`Recreating vector table: ${table.tableName}`);
            const existingRows = this.db
                .query(`SELECT * FROM "${table.tableName}"`)
                .all();
            this.db.run(`DROP TABLE "${table.tableName}"`);
            await this.createTable(table);
            if (existingRows.length > 0) {
                for (let i = 0; i < existingRows.length; i++) {
                    const row = existingRows[i];
                    if (!row)
                        continue;
                    const columns = Object.keys(row);
                    const placeholders = columns.map(() => "?").join(", ");
                    this.db.run(`INSERT INTO "${table.tableName}" (${columns.join(", ")}) VALUES (${placeholders})`, Object.values(row));
                }
            }
            return;
        }
        const tempTableName = `${table.tableName}_temp_${Date.now()}`;
        // Get existing data
        const existingColumns = this.getTableColumns(table.tableName);
        const columnsToKeep = table.fields
            .filter((f) => f.fieldName &&
            existingColumns.find((c) => c.name == f.fieldName &&
                c.type == this.mapDataType(f)))
            .map((f) => f.fieldName);
        // Create temp table with new schema
        const tempTable = { ...table, tableName: tempTableName };
        await this.createTable(tempTable);
        // Copy data if there are common columns
        if (columnsToKeep.length > 0) {
            const columnList = columnsToKeep.map((c) => `"${c}"`).join(", ");
            this.db.run(`INSERT INTO "${tempTableName}" (${columnList}) SELECT ${columnList} FROM "${table.tableName}"`);
        }
        // Drop old table
        this.db.run(`DROP TABLE "${table.tableName}"`);
        // Rename temp table
        this.db.run(`ALTER TABLE "${tempTableName}" RENAME TO "${table.tableName}"`);
    }
    /**
     * Build column definition SQL
     */
    buildColumnDefinition(field) {
        if (!field.fieldName) {
            throw new Error("Field name is required");
        }
        const fieldName = field.sideCar
            ? `+${field.fieldName}`
            : `${field.fieldName}`;
        const parts = [fieldName];
        // Data type mapping
        const dataType = this.mapDataType(field);
        parts.push(dataType);
        // Primary key
        if (field.primaryKey) {
            parts.push("PRIMARY KEY");
            if (field.autoIncrement) {
                parts.push("AUTOINCREMENT");
            }
        }
        // Not null
        if (field.notNullValue || field.primaryKey) {
            if (!field.primaryKey) {
                parts.push("NOT NULL");
            }
        }
        // Unique
        if (field.unique && !field.primaryKey) {
            parts.push("UNIQUE");
        }
        // Default value
        if (field.defaultValue !== undefined) {
            if (typeof field.defaultValue === "string") {
                parts.push(
                // Escape single quotes by doubling them to prevent SQL injection and wrap in single quotes
                `DEFAULT '${field.defaultValue.replace(/'/g, "''")}'`);
            }
            else {
                parts.push(`DEFAULT ${field.defaultValue}`);
            }
        }
        else if (field.defaultValueLiteral) {
            parts.push(`DEFAULT ${field.defaultValueLiteral}`);
        }
        return parts.join(" ");
    }
    /**
     * Map DSQL data types to SQLite types
     */
    mapDataType(field) {
        const dataType = field.dataType?.toLowerCase() || "text";
        const vectorSize = field.vectorSize || 1536;
        // Vector Embeddings
        if (field.isVector) {
            return `FLOAT[${vectorSize}]`;
        }
        // Integer types
        if (dataType.includes("int") ||
            dataType === "bigint" ||
            dataType === "smallint" ||
            dataType === "tinyint") {
            return "INTEGER";
        }
        // Real/Float types
        if (dataType.includes("real") ||
            dataType.includes("float") ||
            dataType.includes("double") ||
            dataType === "decimal" ||
            dataType === "numeric") {
            return "REAL";
        }
        // Blob types
        if (dataType.includes("blob") || dataType.includes("binary")) {
            return "BLOB";
        }
        // Boolean
        if (dataType === "boolean" || dataType === "bool") {
            return "INTEGER"; // SQLite uses INTEGER for boolean (0/1)
        }
        // Date/Time types
        if (dataType.includes("date") || dataType.includes("time")) {
            return "TEXT"; // SQLite stores dates as TEXT or INTEGER
        }
        // Default to TEXT for all text-based types
        return "TEXT";
    }
    /**
     * Build foreign key constraint
     */
    buildForeignKeyConstraint(field) {
        const fk = field.foreignKey;
        let constraint = `FOREIGN KEY ("${field.fieldName}") REFERENCES "${fk.destinationTableName}"("${fk.destinationTableColumnName}")`;
        if (fk.cascadeDelete) {
            constraint += " ON DELETE CASCADE";
        }
        if (fk.cascadeUpdate) {
            constraint += " ON UPDATE CASCADE";
        }
        return constraint;
    }
    /**
     * Sync indexes for a table
     */
    async syncIndexes(table) {
        if (!table.indexes || table.indexes.length === 0) {
            return;
        }
        // Get existing indexes
        const query = this.db.query(`SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='${table.tableName}' AND name NOT LIKE 'sqlite_%'`);
        const existingIndexes = query.all().map((r) => r.name);
        // Drop indexes not in schema
        for (const indexName of existingIndexes) {
            const stillExists = table.indexes.some((idx) => idx.indexName === indexName);
            if (!stillExists) {
                console.log(`Dropping index: ${indexName}`);
                this.db.run(`DROP INDEX IF EXISTS "${indexName}"`);
            }
        }
        // Create new indexes
        for (const index of table.indexes) {
            if (!index.indexName ||
                !index.indexTableFields ||
                index.indexTableFields.length === 0) {
                continue;
            }
            if (!existingIndexes.includes(index.indexName)) {
                console.log(`Creating index: ${index.indexName}`);
                const fields = index.indexTableFields
                    .map((f) => `"${f.value}"`)
                    .join(", ");
                const unique = index.indexType === "regular" ? "" : ""; // SQLite doesn't have FULLTEXT in CREATE INDEX
                this.db.run(`CREATE ${unique}INDEX "${index.indexName}" ON "${table.tableName}" (${fields})`);
            }
        }
    }
    /**
     * Close database connection
     */
    close() {
        this.db.close();
    }
}
export { SQLiteSchemaManager };

# Bun SQLite

@moduletrace/bun-sqlite

A schema-driven SQLite manager for [Bun](https://bun.sh), featuring automatic schema synchronization, type-safe CRUD operations, vector embedding support (via `sqlite-vec`), and TypeScript type definition generation.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Schema Definition](#schema-definition)
- [CLI Commands](#cli-commands)
    - [`schema`](#schema--sync-database-to-schema)
    - [`typedef`](#typedef--generate-typescript-types-only)
    - [`backup`](#backup--back-up-the-database)
    - [`restore`](#restore--restore-the-database-from-a-backup)
- [CRUD API](#crud-api)
    - [Select](#select)
    - [Insert](#insert)
    - [Update](#update)
    - [Delete](#delete)
    - [Raw SQL](#raw-sql)
- [Query API Reference](#query-api-reference)
- [Vector Table Support](#vector-table-support)
- [TypeScript Type Generation](#typescript-type-generation)
- [Default Fields](#default-fields)
- [Project Structure](#project-structure)

---

## Features

- **Schema-first design** — define your database in TypeScript; the library syncs your SQLite file to match
- **Automatic migrations** — adds new columns, recreates tables for complex changes, drops removed tables
- **Type-safe CRUD** — fully generic `select`, `insert`, `update`, `delete` functions with TypeScript generics
- **Rich query DSL** — filtering, ordering, pagination, joins, grouping, full-text search, sub-query counts
- **Vector table support** — create and manage `sqlite-vec` virtual tables for AI/ML embeddings
- **TypeScript codegen** — generate `.ts` type definitions from your schema automatically
- **Zero-config defaults** — `id`, `created_at`, and `updated_at` fields are added to every table automatically

---

## Prerequisites

`@moduletrace/bun-sqlite` is published to a private Gitea npm registry. You must configure your package manager to resolve the `@moduletrace` scope from that registry before installing.

Add the following to your project's `.npmrc` file (create it at the root of your project if it doesn't exist):

```ini
@moduletrace:registry=https://git.tben.me/api/packages/moduletrace/npm/
```

This works for both `bun` and `npm`.

---

## Installation

```bash
bun add @moduletrace/bun-sqlite
```

---

## Quick Start

### 1. Create the config file

Create `bun-sqlite.config.ts` at your project root:

```ts
import type { BunSQLiteConfig } from "@moduletrace/bun-sqlite";

const config: BunSQLiteConfig = {
    db_name: "my-app.db",
    db_schema_file_name: "schema.ts",
    db_dir: "./db", // optional: where to store the db file
    db_backup_dir: ".backups", // optional: name of backups directory. Relative to the db dir.
    typedef_file_path: "./db/types/db.ts", // optional: where to write generated types
};

export default config;
```

### 2. Define your schema

Create `./db/schema.ts` (matching `db_schema_file_name` above):

```ts
import type { BUN_SQLITE_DatabaseSchemaType } from "@moduletrace/bun-sqlite";

const schema: BUN_SQLITE_DatabaseSchemaType = {
    dbName: "my-app",
    tables: [
        {
            tableName: "users",
            fields: [
                { fieldName: "first_name", dataType: "TEXT" },
                { fieldName: "last_name", dataType: "TEXT" },
                { fieldName: "email", dataType: "TEXT", unique: true },
            ],
        },
    ],
};

export default schema;
```

### 3. Sync the schema to SQLite

```bash
bunx bun-sqlite schema
```

This creates the SQLite database file and creates/updates all tables to match your schema.

### 4. Use the CRUD API

```ts
import BunSQLite from "@moduletrace/bun-sqlite";

// Insert
await BunSQLite.insert({
    table: "users",
    data: [{ first_name: "Alice", email: "alice@example.com" }],
});

// Select
const result = await BunSQLite.select({ table: "users" });
console.log(result.payload); // Alice's row

// Update
await BunSQLite.update({
    table: "users",
    targetId: 1,
    data: { first_name: "Alicia" },
});

// Delete
await BunSQLite.delete({ table: "users", targetId: 1 });
```

---

## Configuration

The config file must be named `bun-sqlite.config.ts` and placed at the root of your project.

| Field                 | Type     | Required | Description                                                                                |
| --------------------- | -------- | -------- | ------------------------------------------------------------------------------------------ |
| `db_name`             | `string` | Yes      | Filename for the SQLite database (e.g. `"app.db"`)                                         |
| `db_schema_file_name` | `string` | Yes      | Filename of the schema file relative to `db_dir` (or root if `db_dir` is not set)          |
| `db_backup_dir`       | `string` | No       | Directory for database backups, relative to `db_dir`                                       |
| `db_dir`              | `string` | No       | Root directory for the database file and schema. Defaults to project root                  |
| `typedef_file_path`   | `string` | No       | Output path for generated TypeScript types, relative to project root                       |
| `max_backups`         | `number` | No       | Maximum number of backup files to keep. Oldest are deleted automatically. Defaults to `10` |

---

## Schema Definition

### Database Schema

```ts
interface BUN_SQLITE_DatabaseSchemaType {
    dbName?: string;
    tables: BUN_SQLITE_TableSchemaType[];
}
```

### Table Schema

```ts
interface BUN_SQLITE_TableSchemaType {
    tableName: string;
    tableDescription?: string;
    fields: BUN_SQLITE_FieldSchemaType[];
    indexes?: BUN_SQLITE_IndexSchemaType[];
    uniqueConstraints?: BUN_SQLITE_UniqueConstraintSchemaType[];
    parentTableName?: string; // inherit fields from another table in the schema
    tableNameOld?: string; // rename: set this to the old name to trigger ALTER TABLE RENAME
    isVector?: boolean; // mark this as a sqlite-vec virtual table
    vectorType?: string; // virtual table type, defaults to "vec0"
}
```

### Field Schema

```ts
type BUN_SQLITE_FieldSchemaType = {
    fieldName?: string;
    dataType: "TEXT" | "INTEGER";
    primaryKey?: boolean;
    autoIncrement?: boolean;
    notNullValue?: boolean;
    unique?: boolean;
    defaultValue?: string | number;
    defaultValueLiteral?: string; // raw SQL literal, e.g. "CURRENT_TIMESTAMP"
    foreignKey?: BUN_SQLITE_ForeignKeyType;
    isVector?: boolean; // vector embedding column
    vectorSize?: number; // embedding dimensions (default: 1536)
    sideCar?: boolean; // sqlite-vec "+" prefix for side-car columns
    updatedField?: boolean; // flag that this field definition has changed
};
```

### Foreign Key

```ts
interface BUN_SQLITE_ForeignKeyType {
    destinationTableName: string;
    destinationTableColumnName: string;
    cascadeDelete?: boolean;
    cascadeUpdate?: boolean;
}
```

### Index

```ts
interface BUN_SQLITE_IndexSchemaType {
    indexName?: string;
    indexType?: "regular" | "full_text" | "vector";
    indexTableFields?: { value: string; dataType: string }[];
}
```

### Unique Constraint

```ts
interface BUN_SQLITE_UniqueConstraintSchemaType {
    constraintName?: string;
    constraintTableFields?: { value: string }[];
}
```

---

## CLI Commands

The package provides a `bun-sqlite` CLI binary.

### `schema` — Sync database to schema

```bash
bunx bun-sqlite schema [options]
```

| Option            | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `-v`, `--vector`  | Drop and recreate all vector (`sqlite-vec`) virtual tables |
| `-t`, `--typedef` | Also generate TypeScript type definitions after syncing    |

**Examples:**

```bash
# Sync schema only
bunx bun-sqlite schema

# Sync schema and regenerate types
bunx bun-sqlite schema --typedef

# Sync schema, recreate vector tables, and regenerate types
bunx bun-sqlite schema --vector --typedef
```

### `typedef` — Generate TypeScript types only

```bash
bunx bun-sqlite typedef
```

Reads the schema and writes TypeScript type definitions to the path configured in `typedef_file_path`.

---

### `backup` — Back up the database

```bash
bunx bun-sqlite backup
```

Copies the current database file into `db_backup_dir` with a timestamped filename. After copying, the oldest backups are automatically pruned so the number of stored backups never exceeds `max_backups` (default: 10).

**Example:**

```bash
bunx bun-sqlite backup
# Backing up database ...
# DB Backup Success!
```

---

### `restore` — Restore the database from a backup

```bash
bunx bun-sqlite restore
```

Presents an interactive list of available backups sorted by date (newest first). Select a backup to overwrite the current database file with it.

**Example:**

```bash
bunx bun-sqlite restore
# Restoring up database ...
# ? Select a backup: (Use arrow keys)
# ❯ Backup #1: Mon Mar 02 2026 14:30:00
#   Backup #2: Sun Mar 01 2026 09:15:42
# DB Restore Success!
```

> If no backups exist, the command exits with an error and a reminder to run `backup` first.

---

## CRUD API

Import the default export:

```ts
import BunSQLite from "@moduletrace/bun-sqlite";
```

All methods return an `APIResponseObject<T>`:

```ts
{
    success: boolean;
    payload?: T[];           // array of rows (select)
    singleRes?: T;           // first row (select)
    count?: number;          // total count (when count: true)
    postInsertReturn?: {
        affectedRows?: number;
        insertId?: number;
    };
    error?: string;
    msg?: string;
    debug?: any;
}
```

---

### Select

```ts
BunSQLite.select<T>({ table, query?, count?, targetId? })
```

| Parameter  | Type                  | Description                                                  |
| ---------- | --------------------- | ------------------------------------------------------------ |
| `table`    | `string`              | Table name                                                   |
| `query`    | `ServerQueryParam<T>` | Query/filter options (see [Query API](#query-api-reference)) |
| `count`    | `boolean`             | Return row count instead of rows                             |
| `targetId` | `string \| number`    | Shorthand to filter by `id`                                  |

**Examples:**

```ts
// Get all users
const res = await BunSQLite.select({ table: "users" });

// Get by ID
const res = await BunSQLite.select({ table: "users", targetId: 42 });

// Filter with LIKE
const res = await BunSQLite.select<UserType>({
    table: "users",
    query: {
        query: {
            first_name: { value: "Ali", equality: "LIKE" },
        },
    },
});

// Count rows
const res = await BunSQLite.select({ table: "users", count: true });
console.log(res.count);

// Pagination
const res = await BunSQLite.select({
    table: "users",
    query: { limit: 10, page: 2 },
});
```

---

### Insert

```ts
BunSQLite.insert<T>({ table, data });
```

| Parameter | Type     | Description                    |
| --------- | -------- | ------------------------------ |
| `table`   | `string` | Table name                     |
| `data`    | `T[]`    | Array of row objects to insert |

`created_at` and `updated_at` are set automatically to `Date.now()`.

**Example:**

```ts
const res = await BunSQLite.insert({
    table: "users",
    data: [
        { first_name: "Alice", last_name: "Smith", email: "alice@example.com" },
        { first_name: "Bob", last_name: "Jones", email: "bob@example.com" },
    ],
});

console.log(res.postInsertReturn?.insertId); // last inserted row ID
```

---

### Update

```ts
BunSQLite.update<T>({ table, data, query?, targetId? })
```

| Parameter  | Type                  | Description                 |
| ---------- | --------------------- | --------------------------- |
| `table`    | `string`              | Table name                  |
| `data`     | `Partial<T>`          | Fields to update            |
| `query`    | `ServerQueryParam<T>` | WHERE clause conditions     |
| `targetId` | `string \| number`    | Shorthand to filter by `id` |

A WHERE clause is required. If no condition matches, `success` is `false`.

`updated_at` is set automatically to `Date.now()`.

**Examples:**

```ts
// Update by ID
await BunSQLite.update({
    table: "users",
    targetId: 1,
    data: { first_name: "Alicia" },
});

// Update with custom query
await BunSQLite.update({
    table: "users",
    data: { last_name: "Doe" },
    query: {
        query: {
            email: { value: "alice@example.com", equality: "EQUAL" },
        },
    },
});
```

---

### Delete

```ts
BunSQLite.delete<T>({ table, query?, targetId? })
```

| Parameter  | Type                  | Description                 |
| ---------- | --------------------- | --------------------------- |
| `table`    | `string`              | Table name                  |
| `query`    | `ServerQueryParam<T>` | WHERE clause conditions     |
| `targetId` | `string \| number`    | Shorthand to filter by `id` |

A WHERE clause is required. If no condition is provided, `success` is `false`.

**Examples:**

```ts
// Delete by ID
await BunSQLite.delete({ table: "users", targetId: 1 });

// Delete with condition
await BunSQLite.delete({
    table: "users",
    query: {
        query: {
            first_name: { value: "Ben", equality: "LIKE" },
        },
    },
});
```

---

### Raw SQL

```ts
BunSQLite.sql<T>({ sql, values? })
```

| Parameter | Type                   | Description          |
| --------- | ---------------------- | -------------------- |
| `sql`     | `string`               | Raw SQL statement    |
| `values`  | `(string \| number)[]` | Parameterized values |

SELECT statements return rows; all other statements return `postInsertReturn`.

**Examples:**

```ts
// SELECT
const res = await BunSQLite.sql<UserType>({ sql: "SELECT * FROM users" });
console.log(res.payload);

// INSERT with params
await BunSQLite.sql({
    sql: "INSERT INTO users (first_name, email) VALUES (?, ?)",
    values: ["Charlie", "charlie@example.com"],
});
```

---

## Query API Reference

The `query` parameter on `select`, `update`, and `delete` accepts a `ServerQueryParam<T>` object:

```ts
type ServerQueryParam<T> = {
    query?: { [key in keyof T]: ServerQueryObject };
    selectFields?: (keyof T | { fieldName: keyof T; alias?: string })[];
    omitFields?: (keyof T)[];
    limit?: number;
    page?: number;
    offset?: number;
    order?:
        | { field: keyof T; strategy: "ASC" | "DESC" }
        | { field: keyof T; strategy: "ASC" | "DESC" }[];
    searchOperator?: "AND" | "OR"; // how multiple query fields are joined (default: AND)
    join?: ServerQueryParamsJoin[];
    group?:
        | keyof T
        | { field: keyof T; table?: string }
        | (keyof T | { field: keyof T; table?: string })[];
    countSubQueries?: ServerQueryParamsCount[];
    fullTextSearch?: {
        fields: (keyof T)[];
        searchTerm: string;
        scoreAlias: string;
    };
};
```

### Equality Operators

Set `equality` on any query field to control the comparison:

| Equality                | SQL Equivalent                                         |
| ----------------------- | ------------------------------------------------------ |
| `EQUAL` (default)       | `=`                                                    |
| `NOT EQUAL`             | `!=`                                                   |
| `LIKE`                  | `LIKE '%value%'`                                       |
| `LIKE_RAW`              | `LIKE 'value'` (no auto-wrapping)                      |
| `LIKE_LOWER`            | `LOWER(field) LIKE '%value%'`                          |
| `NOT LIKE`              | `NOT LIKE '%value%'`                                   |
| `GREATER THAN`          | `>`                                                    |
| `GREATER THAN OR EQUAL` | `>=`                                                   |
| `LESS THAN`             | `<`                                                    |
| `LESS THAN OR EQUAL`    | `<=`                                                   |
| `IN`                    | `IN (val1, val2, ...)` — pass array as value           |
| `NOT IN`                | `NOT IN (...)`                                         |
| `BETWEEN`               | `BETWEEN val1 AND val2` — pass `[val1, val2]` as value |
| `IS NULL`               | `IS NULL`                                              |
| `IS NOT NULL`           | `IS NOT NULL`                                          |
| `MATCH`                 | sqlite-vec vector nearest-neighbor search              |

**Example:**

```ts
// Find users with email NOT NULL, ordered by created_at DESC, limit 20
const res = await BunSQLite.select<UserType>({
    table: "users",
    query: {
        query: {
            email: { equality: "IS NOT NULL" },
        },
        order: { field: "created_at", strategy: "DESC" },
        limit: 20,
    },
});
```

### JOIN

```ts
const res = await BunSQLite.select({
    table: "posts",
    query: {
        join: [
            {
                joinType: "LEFT JOIN",
                tableName: "users",
                match: { source: "user_id", target: "id" },
                selectFields: ["first_name", "email"],
            },
        ],
    },
});
```

---

## Vector Table Support

`@moduletrace/bun-sqlite` integrates with [`sqlite-vec`](https://github.com/asg017/sqlite-vec) for storing and querying vector embeddings.

### Define a vector table in the schema

```ts
{
    tableName: "documents",
    isVector: true,
    vectorType: "vec0",   // defaults to "vec0"
    fields: [
        {
            fieldName: "embedding",
            dataType: "TEXT",
            isVector: true,
            vectorSize: 1536,   // embedding dimensions
        },
        {
            fieldName: "title",
            dataType: "TEXT",
            sideCar: true,  // stored as a side-car column (+title) for efficiency
        },
        {
            fieldName: "body",
            dataType: "TEXT",
            sideCar: true,
        },
    ],
}
```

> **Side-car columns** (`sideCar: true`) use sqlite-vec's `+column` syntax. They are stored separately from the vector index, keeping the index lean and fast while still being queryable alongside vector results.

### Sync vector tables

```bash
# Initial sync
bunx bun-sqlite schema

# Recreate vector tables (e.g. after changing vectorSize)
bunx bun-sqlite schema --vector
```

### Query vectors

```ts
const res = await BunSQLite.select({
    table: "documents",
    query: {
        query: {
            embedding: {
                equality: "MATCH",
                value: "<serialized-vector>",
                vector: true,
                vectorFunction: "vec_f32",
            },
        },
        limit: 5,
    },
});
```

---

## TypeScript Type Generation

Run the `typedef` command (or pass `--typedef` to `schema`) to generate a `.ts` file containing:

- A `const` array of all table names (`BunSQLiteTables`)
- A `type` for each table (named `BUN_SQLITE_<DB_NAME>_<TABLE_NAME>`)
- A union type `BUN_SQLITE_<DB_NAME>_ALL_TYPEDEFS`

**Example output** (`db/types/db.ts`):

```ts
export const BunSQLiteTables = ["users"] as const;

export type BUN_SQLITE_MY_APP_USERS = {
    /** The unique identifier of the record. */
    id?: number;
    /** The time when the record was created. (Unix Timestamp) */
    created_at?: number;
    /** The time when the record was updated. (Unix Timestamp) */
    updated_at?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
};

export type BUN_SQLITE_MY_APP_ALL_TYPEDEFS = BUN_SQLITE_MY_APP_USERS;
```

Use the generated types with the CRUD API for full type safety:

```ts
import BunSQLite from "@moduletrace/bun-sqlite";
import { BUN_SQLITE_MY_APP_USERS, BunSQLiteTables } from "./db/types/db";

const res = await BunSQLite.select<BUN_SQLITE_MY_APP_USERS>({
    table: "users" as (typeof BunSQLiteTables)[number],
});
```

---

## Default Fields

Every table automatically receives the following fields — you do not need to declare them in your schema:

| Field        | Type                                         | Description                            |
| ------------ | -------------------------------------------- | -------------------------------------- |
| `id`         | `INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL` | Unique row identifier                  |
| `created_at` | `INTEGER`                                    | Unix timestamp set on insert           |
| `updated_at` | `INTEGER`                                    | Unix timestamp updated on every update |

---

## Project Structure

```
bun-sqlite/
├── src/
│   ├── index.ts                        # Main export (BunSQLite object)
│   ├── commands/
│   │   ├── index.ts                    # CLI entry point
│   │   ├── schema.ts                   # `schema` command
│   │   ├── typedef.ts                  # `typedef` command
│   │   ├── backup.ts                   # `backup` command
│   │   └── restore.ts                  # `restore` command
│   ├── functions/
│   │   └── init.ts                     # Config + schema loader
│   ├── lib/sqlite/
│   │   ├── index.ts                    # Database client (bun:sqlite + sqlite-vec)
│   │   ├── db-schema-manager.ts        # Schema synchronization engine
│   │   ├── db-select.ts                # Select implementation
│   │   ├── db-insert.ts                # Insert implementation
│   │   ├── db-update.ts                # Update implementation
│   │   ├── db-delete.ts                # Delete implementation
│   │   ├── db-sql.ts                   # Raw SQL implementation
│   │   ├── db-generate-type-defs.ts    # Type def generator
│   │   └── schema-to-typedef.ts        # Schema-to-TypeScript converter
│   ├── types/
│   │   └── index.ts                    # All TypeScript types and interfaces
│   └── utils/
│       ├── sql-generator.ts            # SELECT query builder
│       ├── sql-insert-generator.ts     # INSERT query builder
│       ├── sql-gen-operator-gen.ts     # Equality operator mapper
│       ├── sql-equality-parser.ts      # Equality string parser
│       ├── append-default-fields-to-db-schema.ts
│       ├── grab-db-dir.ts              # Resolve db/backup directory paths
│       ├── grab-db-backup-file-name.ts # Generate timestamped backup filename
│       ├── grab-sorted-backups.ts      # List backups sorted newest-first
│       ├── grab-backup-data.ts         # Parse metadata from a backup filename
│       └── trim-backups.ts             # Prune oldest backups over max_backups
└── test/
    └── test-01/                        # Example project using the library
        ├── bun-sqlite.config.ts
        ├── db/
        │   ├── bun-sqlite-schema.ts
        │   └── types/bun-sqlite.ts     # Generated types
        └── src/
            ├── insert.ts
            ├── select.ts
            ├── delete.ts
            └── sql.ts
```

---

## License

MIT

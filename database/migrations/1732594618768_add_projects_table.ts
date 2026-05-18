/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("projects")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("name", "varchar(255)", (col) => col.notNull())
        .addColumn("description", "text")
        .addColumn("status", "varchar(50)", (col) => col.notNull().defaultTo("planning"))
        .addColumn("address", "varchar(255)")
        .addColumn("start_date", "date")
        .addColumn("end_date", "date")
        .addColumn("budget", "integer")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("projects").execute();
}

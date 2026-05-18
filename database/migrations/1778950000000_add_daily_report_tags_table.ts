/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("daily_report_tags")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("name", "varchar(255)", (col) => col.notNull().unique())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("daily_report_tags").execute();
}

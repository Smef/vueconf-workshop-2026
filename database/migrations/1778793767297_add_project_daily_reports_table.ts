/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("project_daily_reports")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("project_id", "integer", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("report_date", "date", (col) => col.notNull())
        .addColumn("summary", "text", (col) => col.notNull())
        .addColumn("photo_file_name", "text")
        .execute();

    await db.schema
        .createIndex("project_daily_reports_project_id_report_date_idx")
        .on("project_daily_reports")
        .columns(["project_id", "report_date"])
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("project_daily_reports").execute();
}

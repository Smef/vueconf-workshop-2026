/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("daily_report_tag_usages")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("daily_report_id", "integer", (col) =>
            col.notNull().references("project_daily_reports.id").onDelete("cascade"),
        )
        .addColumn("daily_report_tag_id", "integer", (col) =>
            col.notNull().references("daily_report_tags.id").onDelete("cascade"),
        )
        .execute();

    await db.schema
        .createIndex("idx_daily_report_tag_usages_report_id")
        .on("daily_report_tag_usages")
        .column("daily_report_id")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("daily_report_tag_usages").execute();
}

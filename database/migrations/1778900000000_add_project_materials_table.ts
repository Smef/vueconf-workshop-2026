/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("project_materials")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("project_id", "integer", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("daily_report_id", "integer", (col) =>
            col.notNull().references("project_daily_reports.id").onDelete("cascade"),
        )
        .addColumn("material_id", "integer", (col) => col.notNull().references("materials.id").onDelete("restrict"))
        .addColumn("quantity", "numeric(12, 2)", (col) => col.notNull())
        .addColumn("notes", "text")
        .execute();

    await db.schema
        .createIndex("project_materials_daily_report_id_idx")
        .on("project_materials")
        .column("daily_report_id")
        .execute();

    await db.schema
        .createIndex("project_materials_project_id_idx")
        .on("project_materials")
        .column("project_id")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("project_materials").execute();
}

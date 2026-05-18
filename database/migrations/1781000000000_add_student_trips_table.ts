/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("student_trips")
        .addColumn("id", "serial", (col) => col.primaryKey())
        .addColumn("student_id", "integer", (col) => col.notNull().references("students.id").onDelete("cascade"))
        .addColumn("trip_id", "integer", (col) => col.notNull().references("trips.id").onDelete("cascade"))
        .addColumn("approved", "boolean")
        .addColumn("approved_by_parent_id", "integer", (col) => col.references("parents.id").onDelete("set null"))
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("student_trips").execute();
}

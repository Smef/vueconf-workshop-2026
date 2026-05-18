/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("students")
        .addColumn("id", "serial", (col) => col.notNull().primaryKey())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("student_number", "varchar", (col) => col.notNull().unique())
        .addColumn("name", "varchar", (col) => col.notNull())
        .execute();

    await db.schema
        .createTable("student_parents")
        .addColumn("id", "serial", (col) => col.notNull().primaryKey())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("student_id", "integer", (col) => col.notNull().references("students.id").onDelete("cascade"))
        .addColumn("parent_id", "integer", (col) => col.notNull().references("parents.id").onDelete("cascade"))
        .execute();

    await db.schema.createIndex("student_parents_student_id_idx").on("student_parents").column("student_id").execute();

    await db.schema.createIndex("student_parents_parent_id_idx").on("student_parents").column("parent_id").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("student_parents").execute();
    await db.schema.dropTable("students").execute();
}

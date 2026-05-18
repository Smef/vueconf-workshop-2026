/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from "kysely";
import { sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
    // Migration code
    await db.schema
        .createTable("parents")
        .addColumn("id", "serial", (col) => col.notNull().primaryKey())
        .addColumn("created_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("updated_at", "timestamp", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("name", "varchar", (col) => col.notNull())
        .addColumn("birthday", "date")
        .addColumn("email", "varchar")
        .addColumn("phone", "varchar")
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    // Migration code
    await db.schema.dropTable("parents").execute();
}

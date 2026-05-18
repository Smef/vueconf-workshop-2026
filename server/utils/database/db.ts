import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import type { Database } from "#server/types/database";

let queryCount = 0;

export function resetQueryCount(): void {
    queryCount = 0;
}

export function getQueryCount(): number {
    return queryCount;
}

export const dialect = new PostgresDialect({
    pool: new Pool({
        host: process.env.NUXT_DB_HOST,
        port: parseInt(process.env.NUXT_DB_PORT || ""),
        database: process.env.NUXT_DB_DATABASE,
        user: process.env.NUXT_DB_USER,
        password: process.env.NUXT_DB_PASSWORD,
        max: 10,
    }),
});

export const db = new Kysely<Database>({
    dialect,
});

export default db;

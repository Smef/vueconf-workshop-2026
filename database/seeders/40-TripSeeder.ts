import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    await db
        .insertInto("trips")
        .values([
            { destination: "Science Museum", date: new Date("2026-06-15 09:00:00") },
            { destination: "Local Zoo", date: new Date("2026-07-20 10:00:00") },
            { destination: "Art Gallery", date: new Date("2026-08-05 13:00:00") },
        ])
        .execute();
}

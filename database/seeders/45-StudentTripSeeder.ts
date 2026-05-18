import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    await db
        .insertInto("student_trips")
        .values([
            { student_id: 1, trip_id: 1, approved: true, approved_by_parent_id: 1 },
            { student_id: 2, trip_id: 1, approved: false, approved_by_parent_id: 2 },
            { student_id: 3, trip_id: 2, approved: null, approved_by_parent_id: null },
            { student_id: 1, trip_id: 2, approved: true, approved_by_parent_id: 1 },
        ])
        .execute();
}

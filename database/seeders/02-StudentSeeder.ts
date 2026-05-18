import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    await db
        .insertInto("students")
        .values([
            { student_number: "S-1001", name: "Alice Chen" },
            { student_number: "S-1002", name: "Ben Torres" },
            { student_number: "S-1003", name: "Camille Dubois" },
            { student_number: "S-1004", name: "Derek Okafor" },
            { student_number: "S-1005", name: "Elisa Martínez" },
        ])
        .execute();
}

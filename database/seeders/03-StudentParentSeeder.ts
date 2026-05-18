import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    const students = await db.selectFrom("students").select(["id", "name"]).execute();
    const parents = await db.selectFrom("parents").select(["id"]).execute();

    const studentByName = (name: string) => students.find((s) => s.name === name)!.id;

    await db
        .insertInto("student_parents")
        .values([
            { student_id: studentByName("Alice Chen"), parent_id: parents[0].id },
            { student_id: studentByName("Alice Chen"), parent_id: parents[1].id },
            { student_id: studentByName("Ben Torres"), parent_id: parents[2].id },
            { student_id: studentByName("Camille Dubois"), parent_id: parents[3].id },
            { student_id: studentByName("Derek Okafor"), parent_id: parents[4].id },
            { student_id: studentByName("Elisa Martínez"), parent_id: parents[0].id },
        ])
        .execute();
}

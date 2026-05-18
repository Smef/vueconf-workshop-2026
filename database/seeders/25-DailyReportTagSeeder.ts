import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    await db
        .insertInto("daily_report_tags")
        .values([
            { name: "Weather Delay" },
            { name: "Injury" },
            { name: "Equipment Failure" },
            { name: "Property Damage" },
            { name: "Material Shortage" },
            { name: "Subcontractor Issue" },
            { name: "Inspection Required" },
            { name: "Safety Violation" },
            { name: "Work Stoppage" },
            { name: "Change Order" },
        ])
        .execute();
}

import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    const reports = await db.selectFrom("project_daily_reports").select("id").execute();
    const tags = await db.selectFrom("daily_report_tags").select("id").execute();

    if (reports.length === 0 || tags.length === 0) return;

    const usages: { daily_report_id: number; daily_report_tag_id: number }[] = [];

    // Deterministic pseudo-random: assign 0-3 tags per report without repeats
    for (let i = 0; i < reports.length; i++) {
        const count = i % 4; // cycles 0, 1, 2, 3
        const shuffled = [...tags].sort((a, b) => ((a.id * (i + 7)) % 13) - ((b.id * (i + 7)) % 13));
        for (let j = 0; j < count; j++) {
            usages.push({
                daily_report_id: reports[i].id,
                daily_report_tag_id: shuffled[j].id,
            });
        }
    }

    if (usages.length === 0) return;

    await db.insertInto("daily_report_tag_usages").values(usages).execute();
}

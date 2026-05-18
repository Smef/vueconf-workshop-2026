import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    const projects = await db.selectFrom("projects").select(["id", "name"]).execute();

    const byName = (name: string) => projects.find((p) => p.name === name)?.id;

    const rows: { project_id: number; report_date: string; summary: string }[] = [];

    const riverside = byName("Riverside Office Complex");
    if (riverside) {
        rows.push(
            {
                project_id: riverside,
                report_date: "2026-05-12",
                summary:
                    "Poured slab for the second-floor mechanical room. Inspector approved rebar layout in the morning. Crew of 9 on site. No safety incidents.",
            },
            {
                project_id: riverside,
                report_date: "2026-05-13",
                summary:
                    "Began framing the north stairwell. Delivery of structural steel pushed to Friday due to mill backlog — adjusted Thursday's work to interior partition layout.",
            },
            {
                project_id: riverside,
                report_date: "2026-05-14",
                summary:
                    "Continued stairwell framing on the second floor. HVAC subcontractor walked the mechanical chase routes with the GC. Rain in the afternoon stopped exterior work for about two hours.",
            },
        );
    }

    const maplewood = byName("Maplewood Elementary Renovation");
    if (maplewood) {
        rows.push(
            {
                project_id: maplewood,
                report_date: "2026-05-13",
                summary:
                    "Demolition of east wing classrooms complete. Asbestos abatement team finishing tile removal in corridor B. ADA ramp formwork started at the main entrance.",
            },
            {
                project_id: maplewood,
                report_date: "2026-05-14",
                summary:
                    "Poured ADA ramp at main entrance. New rooftop HVAC unit staged on site for tomorrow's crane lift. Reviewed updated electrical drawings with the foreman.",
            },
        );
    }

    const greenfield = byName("Greenfield Distribution Center");
    if (greenfield) {
        rows.push({
            project_id: greenfield,
            report_date: "2026-05-14",
            summary:
                "Tilt-up panel #14 and #15 set this morning. Crane operator reported steady wind under 10mph all day. Loading dock excavation 60% complete.",
        });
    }

    if (rows.length === 0) return;

    await db.insertInto("project_daily_reports").values(rows).execute();
}

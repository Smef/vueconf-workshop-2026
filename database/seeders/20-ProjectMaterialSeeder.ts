import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    const reports = await db
        .selectFrom("project_daily_reports")
        .innerJoin("projects", "projects.id", "project_daily_reports.project_id")
        .select([
            "project_daily_reports.id as report_id",
            "project_daily_reports.project_id",
            "project_daily_reports.report_date",
            "projects.name as project_name",
        ])
        .execute();

    const materials = await db.selectFrom("materials").select(["id", "name"]).execute();
    const materialId = (name: string) => materials.find((m) => m.name === name)?.id;

    const reportByProjectAndDate = (projectName: string, date: string) =>
        reports.find((r) => r.project_name === projectName && String(r.report_date).startsWith(date));

    const rows: {
        project_id: number;
        daily_report_id: number;
        material_id: number;
        quantity: string;
        notes: string | null;
    }[] = [];

    function add(projectName: string, date: string, materialName: string, quantity: number, notes: string | null) {
        const report = reportByProjectAndDate(projectName, date);
        const matId = materialId(materialName);
        if (!report || !matId) return;
        rows.push({
            project_id: report.project_id,
            daily_report_id: report.report_id,
            material_id: matId,
            quantity: quantity.toFixed(2),
            notes,
        });
    }

    // Riverside slab pour (2026-05-12)
    add(
        "Riverside Office Complex",
        "2026-05-12",
        "Ready-Mix Concrete (3000 psi)",
        42,
        "Second-floor mechanical room slab.",
    );
    add("Riverside Office Complex", "2026-05-12", 'Rebar #4 (1/2")', 86, "Slab reinforcement grid.");

    // Riverside stairwell framing (2026-05-13)
    add("Riverside Office Complex", "2026-05-13", "2x6 Stud (8 ft)", 64, "North stairwell wall framing.");
    add("Riverside Office Complex", "2026-05-13", 'OSB Sheathing (7/16")', 22, "Stairwell shear walls.");

    // Riverside framing continued (2026-05-14)
    add("Riverside Office Complex", "2026-05-14", "2x4 Stud (8 ft)", 38, "Interior partition layout, second floor.");

    // Maplewood ramp (2026-05-14)
    add(
        "Maplewood Elementary Renovation",
        "2026-05-14",
        "Ready-Mix Concrete (3000 psi)",
        6,
        "ADA ramp at main entrance.",
    );
    add("Maplewood Elementary Renovation", "2026-05-14", 'Rebar #4 (1/2")', 18, "Ramp reinforcement.");

    // Greenfield tilt-up (2026-05-14)
    add(
        "Greenfield Distribution Center",
        "2026-05-14",
        "Ready-Mix Concrete (3000 psi)",
        28,
        "Panel pours for #16-17 (poured for next set).",
    );
    add(
        "Greenfield Distribution Center",
        "2026-05-14",
        'Concrete Masonry Block (8")',
        240,
        "Loading dock retaining wall.",
    );

    if (rows.length === 0) return;

    await db.insertInto("project_materials").values(rows).execute();
}

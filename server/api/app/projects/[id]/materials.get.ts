import { z } from "zod";

const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    const { id: projectId } = await getValidatedRouterParams(event, paramsSchema.parse);

    const usages = await ProjectMaterial.where("project_id", projectId).orderBy("id", "asc").get();
    if (!usages.length) return [];

    const materialIds = [...new Set(usages.map((u) => u.material_id))];
    const reportIds = [...new Set(usages.map((u) => u.daily_report_id))];

    const [materials, reports] = await Promise.all([
        Material.whereIn("id", materialIds).get(),
        ProjectDailyReport.whereIn("id", reportIds).get(),
    ]);

    const materialById = new Map(materials.map((m) => [m.id, m]));
    const reportById = new Map(reports.map((r) => [r.id, r]));

    return usages
        .map((u) => ({
            id: u.id,
            quantity: u.quantity,
            report_date: reportById.get(u.daily_report_id)?.report_date ?? null,
            daily_report_id: u.daily_report_id,
            material: materialById.get(u.material_id) ?? null,
        }))
        .sort((a, b) => {
            const da = a.report_date ? new Date(a.report_date).getTime() : 0;
            const db = b.report_date ? new Date(b.report_date).getTime() : 0;
            return db - da;
        });
});

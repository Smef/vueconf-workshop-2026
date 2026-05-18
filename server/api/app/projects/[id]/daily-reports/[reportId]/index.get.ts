import { z } from "zod";

const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
    reportId: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    const { id, reportId } = await getValidatedRouterParams(event, paramsSchema.parse);
    const projectId = id;

    const report = await ProjectDailyReport.with("project").find(reportId);
    if (!report || report.project_id !== projectId) {
        throw createError({ statusCode: 404, statusMessage: "Daily report not found" });
    }

    const usages = await ProjectMaterial.where("daily_report_id", reportId).orderBy("id", "asc").get();

    const materialIds = [...new Set(usages.map((u) => u.material_id))];
    const materials = materialIds.length ? await Material.whereIn("id", materialIds).get() : [];
    const materialById = new Map(materials.map((m) => [m.id, m]));

    return {
        report: {
            ...report,
            photo_path: report.photo_file_name ? `/storage/public/${report.photoStoragePath}` : null,
        },
        materials: usages.map((u) => ({
            id: u.id,
            material_id: u.material_id,
            quantity: u.quantity,
            notes: u.notes,
            material: materialById.get(u.material_id) ?? null,
        })),
    };
});

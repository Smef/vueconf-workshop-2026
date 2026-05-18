import { z } from "zod";

const bodySchema = z.object({
    material_id: z.coerce.number().int().positive(),
    quantity: z.coerce.number().positive(),
    notes: z.string().trim().nullable().optional(),
});

const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
    reportId: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    const { id, reportId } = await getValidatedRouterParams(event, paramsSchema.parse);
    const projectId = id;

    const report = await ProjectDailyReport.find(reportId);
    if (!report || report.project_id !== projectId) {
        throw createError({ statusCode: 404, statusMessage: "Daily report not found" });
    }

    const { material_id: materialId, quantity, notes } = await readValidatedBody(event, bodySchema.parse);

    const material = await Material.find(materialId);
    if (!material) {
        throw createError({ statusCode: 404, statusMessage: "Material not found" });
    }

    const usage = await ProjectMaterial.create({
        project_id: projectId,
        daily_report_id: reportId,
        material_id: materialId,
        quantity: quantity.toFixed(2),
        notes: notes ?? null,
    });

    return usage;
});

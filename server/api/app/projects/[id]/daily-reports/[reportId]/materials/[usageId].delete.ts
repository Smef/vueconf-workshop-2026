import { z } from "zod";
const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
    reportId: z.coerce.number().int().positive(),
    usageId: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    const { id, reportId, usageId } = await getValidatedRouterParams(event, paramsSchema.parse);
    const projectId = id;

    const usage = await ProjectMaterial.find(usageId);
    if (!usage || usage.daily_report_id !== reportId || usage.project_id !== projectId) {
        throw createError({ statusCode: 404, statusMessage: "Material usage not found" });
    }

    await ProjectMaterial.destroy(usageId);

    return { ok: true };
});

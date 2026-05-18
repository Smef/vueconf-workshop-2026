import { z } from "zod";

const paramsSchema = z.object({
    tagId: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    const { tagId } = await getValidatedRouterParams(event, paramsSchema.parse);

    const tag = await DailyReportTag.find(tagId);
    if (!tag) {
        throw createError({ statusCode: 404, statusMessage: "Tag not found" });
    }

    await DailyReportTag.destroy(tagId);
    return { ok: true };
});

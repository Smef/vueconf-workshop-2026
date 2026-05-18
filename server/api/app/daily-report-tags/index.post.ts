import { z } from "zod";

const bodySchema = z.object({
    name: z.string().trim().min(1).max(255),
});

export default defineEventHandler(async (event) => {
    const { name } = await readValidatedBody(event, bodySchema.parse);

    const existing = await DailyReportTag.where("name", name).get();
    if (existing.length > 0) {
        throw createError({ statusCode: 409, statusMessage: "A tag with that name already exists" });
    }

    const tag = await DailyReportTag.create({ name });
    return tag;
});

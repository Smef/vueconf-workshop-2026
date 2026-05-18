import { z } from "zod";

const querySchema = z.object({
    q: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const { q } = await getValidatedQuery(event, querySchema.parse);

    if (!q) {
        return await Parents.orderBy("name", "asc").get();
    }

    const search = `%${q.trim()}%`;

    return await Parents.where("name", "ilike", search).orderBy("name", "asc").get();
});

import { z } from "zod";

const querySchema = z.object({
    q: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const { q } = await getValidatedQuery(event, querySchema.parse);
    const pattern = q?.trim();

    if (!pattern) {
        return await Trip.orderBy("date", "asc").get();
    }

    const search = `%${pattern}%`;
    const trips = await Trip.where("destination", "ilike", search).orderBy("date", "asc").get();

    return trips;
});

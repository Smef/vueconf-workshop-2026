import { z } from "zod";

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

    const trip = await Trip.find(id);
    if (!trip) {
        throw createError({ statusCode: 404, statusMessage: "Trip not found" });
    }

    const studentTrips = await StudentTrip.where("trip_id", "=", id).with("student").with("approvedBy").get();

    return {
        trip,
        studentTrips,
    };
});

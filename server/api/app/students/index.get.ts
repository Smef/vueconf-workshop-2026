import { z } from "zod";
import { Student } from "~~/server/utils/database/models/Student";

const querySchema = z.object({
    q: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const { q } = await getValidatedQuery(event, querySchema.parse);
    const pattern = q?.trim();

    if (!pattern) {
        return await Student.orderBy("name", "asc").get();
    }

    const search = `%${pattern}%`;
    const students = await Student.where((eb) =>
        eb.or([eb("name", "ilike", search), eb("student_number", "ilike", search)]),
    )
        .orderBy("name", "asc")
        .get();

    return students;
});

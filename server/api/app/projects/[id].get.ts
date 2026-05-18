import { z } from "zod";

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

    const project = await Project.find(id);
    if (!project) {
        throw createError({ statusCode: 404, statusMessage: "Project not found" });
    }

    return project;
});

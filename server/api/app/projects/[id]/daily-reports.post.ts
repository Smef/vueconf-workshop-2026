import { z } from "zod";

const fieldsSchema = z.object({
    report_date: z
        .string()
        .trim()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "report_date must be YYYY-MM-DD")
        .optional(),
    summary: z.string().trim().min(1, "Summary is required"),
});

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

    const project = await Project.find(id);
    if (!project) {
        throw createError({ statusCode: 404, statusMessage: "Project not found" });
    }

    const parts = await readMultipartFormData(event);

    const { report_date, summary } = fieldsSchema.parse({
        report_date: parts?.find((p) => p.name === "report_date")?.data?.toString(),
        summary: parts?.find((p) => p.name === "summary")?.data?.toString(),
    });

    const reportDate = report_date || new Date().toISOString().slice(0, 10);

    const photoPart = parts?.find((p) => p.name === "photo");

    if (photoPart?.data && photoPart.data.length > 0 && !allowedImageTypes.includes(photoPart.type ?? "")) {
        throw createError({ statusCode: 400, statusMessage: "Photo must be an image file (jpeg, png, gif, webp)" });
    }

    const report = await ProjectDailyReport.create({
        project_id: id,
        report_date: reportDate,
        summary,
        photo_file_name: null,
    });

    if (photoPart?.data && photoPart.data.length > 0) {
        await report.savePhoto(photoPart.data, photoPart.filename ?? "photo.jpg");
    }

    return report;
});

import { z, toJSONSchema } from "zod";

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

    if (photoPart?.data && photoPart.data.length > 0) {
        const imageValidationResponse = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            inlineData: {
                                mimeType: photoPart.type ?? "image/jpeg",
                                data: photoPart.data.toString("base64"),
                            },
                        },
                        {
                            text: "Is this image a picture of roof shingles being installed on a construction site? Answer with only 'yes' or 'no'.",
                        },
                    ],
                },
            ],
        });

        const analysisText = imageValidationResponse.text?.toLowerCase().trim() ?? "";
        if (!analysisText.startsWith("yes")) {
            throw createError({
                statusCode: 400,
                statusMessage: "The uploaded photo must show roof shingles being installed. Please upload a valid photo.",
            });
        }
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

    const tags = await DailyReportTag.select(["id", "name"]).get();

    const tagResponseSchema = z.object({
        tags: z.array(z.number()),
    });

    const tagListString = tags.map((tag) => `${tag.id} - ${tag.name}`).join("\n");

    const prompt = `
Below is a list of events (ID and event name) that may happen in a given day on a construction site. Based on the summary of the daily report, identify which events are mentioned in the summary and return the corresponding tag IDs from the provided list. We'll use this to tag the summaries with the tags that you select.
\n
Tags:\n
${tagListString}
\n
Summary: \n
${summary}`;

    const aiResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: toJSONSchema(tagResponseSchema),
        },
    });

    const matchedTagIds = tagResponseSchema.parse(JSON.parse(aiResponse.text ?? "{}")).tags;

    await Promise.all(
        matchedTagIds.map((tagId) =>
            DailyReportTagUsage.create({
                daily_report_id: report.id,
                daily_report_tag_id: tagId,
            }),
        ),
    );

    return report;
});

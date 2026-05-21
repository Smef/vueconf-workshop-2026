export default defineEventHandler(async () => {
    const reports = await ProjectDailyReport.all();

    for (const report of reports) {
        const embeddingResponse = await embedContent(report.summary, "RETRIEVAL_DOCUMENT");

        const values = embeddingResponse.embeddings?.[0]?.values;
        if (!values) {
            console.error(`Failed to generate embedding for report ${report.id}`);
            continue;
        }

        const vectorRaw = `[${values.toString()}]`;

        report.summary_embedding = vectorRaw;
        await report.save();
    }

    return "success";
});

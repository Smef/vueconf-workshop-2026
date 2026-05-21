import { z } from "zod";
import { sql } from "kysely";

const querySchema = z.object({
    q: z.string().optional(),
});

export default defineEventHandler(async (event) => {
    const { q } = await getValidatedQuery(event, querySchema.parse);

    if (!q) {
        return Project.all();
    }

    const embeddingResponse = await embedContent(q, "RETRIEVAL_QUERY");

    const values = embeddingResponse.embeddings?.[0]?.values;
    if (!values) {
        throw createError({ statusCode: 500, statusMessage: "Failed to generate embedding" });
    }

    const vectorLiteral = `[${values.toString()}]`;

    const matchingReports = await ProjectDailyReport.where("summary_embedding", "is not", null)
        .select(["id", "project_id", sql<number>`summary_embedding <=> ${vectorLiteral}::vector`.as("distance")])
        .orderBy(sql`summary_embedding <=> ${vectorLiteral}::vector`)
        .limit(10)
        .get();

    // find the best match and then only get items which are relatively close to that
    const bestDistance = matchingReports[0]?.distance ?? Infinity;
    const relevantReports = matchingReports.filter((r) => r.distance < bestDistance + 0.05);

    const vectorProjectIds = relevantReports.map((r) => r.project_id);
    const pattern = `%${q}%`;
    return Project.where((eb) =>
        eb.or([
            eb("name", "ilike", pattern),
            ...(vectorProjectIds.length > 0 ? [eb("id", "in", vectorProjectIds)] : []),
        ]),
    ).get();
});

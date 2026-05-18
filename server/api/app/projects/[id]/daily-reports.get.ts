import { z } from "zod";

const paramsSchema = z.object({
    id: z.coerce.number().int().positive(),
});

export default defineEventHandler(async (event) => {
    const { id } = await getValidatedRouterParams(event, paramsSchema.parse);

    const reports = await ProjectDailyReport.where("project_id", id)
        .orderBy("report_date", "desc")
        .orderBy("id", "desc")
        .get();

    if (reports.length === 0) return [];

    // get the tags for the reports and map them to their respective report
    const reportIds = reports.map((r) => r.id);
    const usages = await DailyReportTagUsage.whereIn("daily_report_id", reportIds).with("tag").get();

    const usagesByReportId = usages.reduce((acc, usage) => {
        const list = acc.get(usage.daily_report_id) ?? [];
        list.push(usage);
        acc.set(usage.daily_report_id, list);
        return acc;
    }, new Map<number, typeof usages>());

    return reports.map((report) => ({
        id: report.id,
        project_id: report.project_id,
        report_date: report.report_date,
        summary: report.summary,
        photo_path: report.photo_file_name ? `/storage/public/${report.photoStoragePath}` : null,
        created_at: report.created_at,
        updated_at: report.updated_at,
        tags: usagesByReportId.get(report.id) ?? [],
    }));
});

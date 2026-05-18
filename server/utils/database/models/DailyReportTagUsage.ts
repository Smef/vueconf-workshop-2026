import { defineModel } from "vasta-orm";

export class DailyReportTagUsage extends defineModel({
    db,
    table: "daily_report_tag_usages",
}) {
    get dailyReport() {
        return this.belongsTo(ProjectDailyReport, "daily_report_id");
    }

    get tag() {
        return this.belongsTo(DailyReportTag, "daily_report_tag_id");
    }
}

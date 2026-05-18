import { defineModel } from "vasta-orm";

export class DailyReportTag extends defineModel({
    db,
    table: "daily_report_tags",
}) {
    get usages() {
        return this.hasMany(DailyReportTagUsage, "daily_report_tag_id");
    }
}

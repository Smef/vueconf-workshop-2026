import { defineModel } from "vasta-orm";

export class Project extends defineModel({
    db,
    table: "projects",
}) {
    get dailyReports() {
        return this.hasMany(ProjectDailyReport, "project_id");
    }
}

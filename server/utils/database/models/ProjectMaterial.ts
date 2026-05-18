import { defineModel } from "vasta-orm";

export class ProjectMaterial extends defineModel({
    db,
    table: "project_materials",
}) {
    get project() {
        return this.belongsTo(Project, "project_id");
    }

    get dailyReport() {
        return this.belongsTo(ProjectDailyReport, "daily_report_id");
    }
}

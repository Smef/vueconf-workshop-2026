import { defineModel } from "vasta-orm";

export class ProjectDailyReport extends defineModel({
    db,
    table: "project_daily_reports",
}) {
    get project() {
        return this.belongsTo(Project, "project_id");
    }

    get tags() {
        return this.hasMany(DailyReportTagUsage, "daily_report_id").with("tag");
    }

    get photoStoragePath() {
        return `daily-reports/${this.id}/${this.photo_file_name}`;
    }

    async savePhoto(data: File | Buffer, fileName?: string) {
        if (!this.id) {
            await this.save();
        }
        if (data instanceof File) {
            this.photo_file_name = fileName || data.name;
            await storagePublic.setItem(this.photoStoragePath, data);
        } else {
            this.photo_file_name = fileName ?? "photo.jpg";
            await storagePublic.setItemRaw(this.photoStoragePath, data);
        }
        await this.save();
    }
}

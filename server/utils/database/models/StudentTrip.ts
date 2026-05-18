import { defineModel } from "vasta-orm";

export class StudentTrip extends defineModel({
    db,
    table: "student_trips",
}) {
    get student() {
        return this.belongsTo(Student, "student_id");
    }

    get trip() {
        return this.belongsTo(Trip, "trip_id");
    }

    get approvedBy() {
        return this.belongsTo(Parents, "approved_by_parent_id");
    }
}

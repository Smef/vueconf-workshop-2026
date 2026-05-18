import { defineModel } from "vasta-orm";

export class StudentParent extends defineModel({
    db,
    table: "student_parents",
    attributes: {},
}) {
    get student() {
        return this.belongsTo(Student, "student_id");
    }

    get person() {
        return this.belongsTo(Parents, "parent_id");
    }
}

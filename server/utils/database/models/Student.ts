import { defineModel } from "vasta-orm";

export class Student extends defineModel({
    db,
    table: "students",
    attributes: {},
}) {
    get parents() {
        return this.hasMany(StudentParent, "student_id");
    }

    get trips() {
        return this.hasMany(StudentTrip, "student_id");
    }
}

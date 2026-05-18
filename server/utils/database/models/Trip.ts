import { defineModel } from "vasta-orm";
import db from "~~/server/utils/database/db";
import { StudentTrip } from "./StudentTrip";

export class Trip extends defineModel({
    db,
    table: "trips",
}) {
    get student_trips() {
        return this.hasMany(StudentTrip, "trip_id");
    }
}

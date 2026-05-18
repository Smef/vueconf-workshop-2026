import { defineModel } from "vasta-orm";

export class Material extends defineModel({
    db,
    table: "materials",
}) {}

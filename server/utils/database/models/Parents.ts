import { defineModel } from "vasta-orm";

export class Parents extends defineModel({
    db,
    table: "parents",
    attributes: {
        secret: {
            hidden: true,
        },
    },
}) {}

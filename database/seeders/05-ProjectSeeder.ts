import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<Database>): Promise<void> {
    await db
        .insertInto("projects")
        .values([
            {
                name: "Riverside Office Complex",
                description: "5-story mixed-use office building with ground-floor retail.",
                status: "active",
                address: "400 Riverside Dr, Atlanta, GA 30305",
                start_date: "2025-03-01",
                end_date: "2026-09-30",
                budget: 4200000,
            },
            {
                name: "Maplewood Elementary Renovation",
                description: "Structural reinforcement, HVAC replacement, and ADA upgrades.",
                status: "active",
                address: "120 Maplewood Ln, Decatur, GA 30030",
                start_date: "2025-06-15",
                end_date: "2025-12-20",
                budget: 875000,
            },
            {
                name: "Harbor View Condos",
                description: "32-unit waterfront condominium development.",
                status: "planning",
                address: "88 Harbor Blvd, Savannah, GA 31401",
                start_date: "2026-02-01",
                end_date: null,
                budget: 9500000,
            },
            {
                name: "Downtown Parking Deck",
                description: "600-space multi-level parking structure with EV charging stations.",
                status: "completed",
                address: "55 Peachtree St NW, Atlanta, GA 30303",
                start_date: "2024-01-10",
                end_date: "2025-04-30",
                budget: 3100000,
            },
            {
                name: "Greenfield Distribution Center",
                description: "150,000 sq ft warehouse and logistics hub.",
                status: "active",
                address: "900 Industrial Pkwy, Macon, GA 31201",
                start_date: "2025-01-20",
                end_date: "2025-11-15",
                budget: 6750000,
            },
            {
                name: "Lakeside Single-Family Homes",
                description: "12-lot residential subdivision on former farmland.",
                status: "planning",
                address: "Old Mill Rd, Gainesville, GA 30501",
                start_date: "2026-04-01",
                end_date: null,
                budget: null,
            },
        ])
        .execute();
}

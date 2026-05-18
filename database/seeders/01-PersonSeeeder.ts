import type { Database } from "../../server/types/database";
import type { Kysely } from "kysely";

// replace `any` with your database interface.
export async function seed(db: Kysely<Database>): Promise<void> {
    // seed code goes here...
    // note: this function is mandatory. you must implement this function.
    await db
        .insertInto("parents")
        .values([
            {
                name: "David",
                birthday: new Date("1986-07-20"),
                email: "david@gearboxgo.com",
                phone: "404-123-1234",
            },
            {
                name: "Alex",
                birthday: new Date("1990-03-14"),
                email: "alex@example.com",
                phone: "770-555-0191",
            },
            {
                name: "Jordan",
                birthday: new Date("1992-09-02"),
                email: "jordan.lee@example.com",
            },
            {
                name: "Priya",
                birthday: new Date("1989-12-05"),
                email: "priya.shah@example.com",
                phone: "770-555-0177",
            },
            {
                name: "Morgan",
                birthday: new Date("1994-06-18"),
                email: "morgan.rivera@example.com",
                phone: "678-555-0168",
            },
        ])
        .execute();
}

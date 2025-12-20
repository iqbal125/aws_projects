import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const items = pgTable(
    "items",
    {
        id: uuid("id").primaryKey(),
        title: varchar("title", { length: 255 }).notNull(),
        description: varchar("description", { length: 1000 }).notNull(),
    }
);

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

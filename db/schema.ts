import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const messageTable = sqliteTable("messages", {
  id: int().primaryKey({ autoIncrement: true }),
  sender: text().notNull(),
  content: text(),
});

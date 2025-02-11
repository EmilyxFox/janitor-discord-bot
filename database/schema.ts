import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const spoilerEnforcedChannels = sqliteTable("spoiler_enforced_channels", {
  channelId: text("channel_id").notNull().primaryKey(),
  setBy: text("set_by").notNull(),
  setAt: integer("set_at", { mode: "timestamp_ms" }).notNull(),
});

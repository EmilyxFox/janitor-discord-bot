import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const spoilerEnforcedChannels = sqliteTable("spoiler_enforced_channels", {
  channelId: text("channel_id").notNull().primaryKey(),
  setBy: text("set_by").notNull(),
  setAt: integer("set_at", { mode: "timestamp_ms" }).notNull(),
});

export const guildDefaultRoles = sqliteTable("guild_default_roles", {
  guildId: text("guild_id").notNull().primaryKey(),
  roleId: text("role_id").notNull(),
  setBy: text("set_by").notNull(),
  setAt: integer("set_at", { mode: "timestamp_ms" }).notNull(),
});

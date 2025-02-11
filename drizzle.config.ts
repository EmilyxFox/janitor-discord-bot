import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./database/schema.ts",
  out: "./database/drizzle",
  dbCredentials: {
    url: Deno.env.get("DB_URL") as string,
  },
});

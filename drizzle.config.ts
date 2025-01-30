import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./db/migrations",
  schema: "./db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: Deno.env.get("DATABASE_URL")!,
  },
});

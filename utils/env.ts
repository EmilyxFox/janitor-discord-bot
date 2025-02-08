import { z } from "npm:zod";

const envSchema = z.object({
  "DISCORD_TOKEN": z.string(),
  "GUILDS": z.string().optional(),
  "CLIENT_ID": z.string(),
  "DEV": z.enum(["TRUE", "FALSE"]).optional().default("FALSE").transform((v) => v === "TRUE"),
  "REPO_URL": z.string().url().optional().default("https://github.com/EmilyxFox/janitor-discord-bot/"),
});

export const env = envSchema.parse(Deno.env.toObject());

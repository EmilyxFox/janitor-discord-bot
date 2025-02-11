import { z } from "npm:zod";

const envSchema = z.object({
  "DISCORD_TOKEN": z.string(),
  "GUILDS": z.string().optional(),
  "DEPLOY_COMMANDS_TO": z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.enum(["GLOBAL", "GUILDS"]))
    .default("GLOBAL"),
  "DB_URL": z.string().url(),
  "DB_AUTH": z.string().optional(),
  "DEV": z
    .string()
    .default("FALSE")
    .transform((val) => val.toUpperCase()) // Normalize to uppercase
    .refine((val) => ["TRUE", "FALSE"].includes(val), {
      message: "DEV must be either 'true' or 'false' (case insensitive)",
    })
    .transform((val) => val === "TRUE"), // Convert to boolean,
  "REPO_URL": z.string().url().optional().default("https://github.com/EmilyxFox/janitor-discord-bot/"),
});

export const env = envSchema.parse(Deno.env.toObject());

import { z } from "npm:zod";

const envSchema = z.object({
  "DISCORD_TOKEN": z.string(),
  "CLIENT_ID": z.string(),
  "DEV": z.enum(["TRUE", "FALSE"]).optional().default("FALSE").transform((v) => v === "TRUE"),
});

export const env = envSchema.parse(Deno.env.toObject());

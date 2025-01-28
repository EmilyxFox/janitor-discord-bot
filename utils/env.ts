import { z } from "npm:zod";

const envSchema = z.object({
  "DISCORD_TOKEN": z.string(),
  "CLIENT_ID": z.string(),
});

export const env = envSchema.parse(Deno.env.toObject());

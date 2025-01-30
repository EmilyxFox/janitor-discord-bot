import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "$utils/env.ts";

const client = createClient({
  url: env.DATABASE_URL,
});

export const db = drizzle({ client });

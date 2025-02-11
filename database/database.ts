import { drizzle } from "drizzle-orm/libsql/http";
import { env } from "$utils/env.ts";
import { getLogger } from "@logtape/logtape";
import { LibSQLDatabase } from "drizzle-orm/libsql/driver-core";
import { Client } from "@libsql/client/http";

const log = getLogger(["database"]);

export let db: LibSQLDatabase<Record<string, unknown>> & { $client: Client };

try {
  db = drizzle({
    connection: {
      url: env.DB_URL,
      ...(env.DB_AUTH ? { authToken: env.DB_AUTH } : {}),
    },
  });
  log.info("Connected to database.");
} catch (error) {
  if (error instanceof Error) {
    log.error(`Error connecting to database: {errorMessage}`, {
      errorMessage: `${error.name} ${error.message}`,
      errorStack: error.stack,
    });
  }
  Deno.exit(1);
}

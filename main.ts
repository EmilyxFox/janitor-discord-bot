import { setupLogging } from "./logging/logger.ts";
import { DiscordBot } from "./discord/DiscordBot.ts";
import { attachGracefulShutdownListeners } from "$utils/gracefulShutdown.ts";
import { getLogger } from "@logtape/logtape";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./database/database.ts";

await setupLogging();

const log = getLogger(["system"]);

log.info("Migrating database...");

try {
  await migrate(db, {
    migrationsFolder: "./database/drizzle",
  });
} catch (error) {
  if (error instanceof Error) {
    log.error(`Error migrating database: {errorMessage}`, {
      errorMessage: `${error.name} ${error.message}`,
      errorStack: error.stack,
    });
  }
  Deno.exit(1);
}

log.info("Starting bot...");

const bot = new DiscordBot();

bot.initialise();

attachGracefulShutdownListeners(bot);

import { DiscordBot } from "./discord/DiscordBot.ts";
import { env } from "$utils/env.ts";
import { attachGracefulShutdownListeners } from "$utils/gracefulShutdown.ts";
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "./db/database.ts";

console.log("Starting bot...");

const bot = new DiscordBot({
  token: env.DISCORD_TOKEN,
  clientId: env.CLIENT_ID,
});

await migrate(db, { migrationsFolder: "./db/migrations" });

bot.initialise();

attachGracefulShutdownListeners(bot);

import { setupLogging } from "./logging/logger.ts";
import { DiscordBot } from "./discord/DiscordBot.ts";
import { env } from "$utils/env.ts";
import { attachGracefulShutdownListeners } from "$utils/gracefulShutdown.ts";
import { getLogger } from "@logtape/logtape";

await setupLogging();

const log = getLogger(["system"]);

log.info("Starting bot...");

const bot = new DiscordBot(env.DISCORD_TOKEN);

bot.initialise();

attachGracefulShutdownListeners(bot);

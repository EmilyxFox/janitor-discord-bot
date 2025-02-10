import { setupLogging } from "./logging/logger.ts";
import { DiscordBot } from "./discord/DiscordBot.ts";
import { attachGracefulShutdownListeners } from "$utils/gracefulShutdown.ts";
import { getLogger } from "@logtape/logtape";

await setupLogging();

const log = getLogger(["system"]);

log.info("Starting bot...");

const bot = new DiscordBot();

bot.initialise();

attachGracefulShutdownListeners(bot);

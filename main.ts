import { DiscordBot } from "./discord/DiscordBot.ts";
import { env } from "$utils/env.ts";
import { attachGracefulShutdownListeners } from "$utils/gracefulShutdown.ts";

console.log("Starting bot...");

const bot = new DiscordBot({
  token: env.DISCORD_TOKEN,
  clientId: env.CLIENT_ID,
});

bot.initialise();

attachGracefulShutdownListeners(bot);

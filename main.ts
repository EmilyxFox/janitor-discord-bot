import { DiscordBot } from "./discord/DiscordBot.ts";
import { env } from "./utils/env.ts";
import { shutdownGracefully } from "$utils/gracefulShutdown.ts";

console.log("Starting bot...");

const bot = new DiscordBot({
  token: env.DISCORD_TOKEN,
  clientId: env.CLIENT_ID,
});

bot.initialise();

Deno.addSignalListener("SIGTERM", () => shutdownGracefully(bot));
Deno.addSignalListener("SIGINT", () => shutdownGracefully(bot));

import { DiscordBot } from "./discord/client.ts";
import { env } from "./utils/env.ts";

const bot = new DiscordBot({
  token: env.DISCORD_TOKEN,
  clientId: env.CLIENT_ID,
});

bot.initialise();

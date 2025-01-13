import { DiscordBot } from "./discord/client.ts";

const token = Deno.env.get("DISCORD_TOKEN");

if (!token) {
  throw new Error('No discord token provided. Please set ENV "DISCORD_TOKEN"');
}

const bot = new DiscordBot({
  token: token,
});

bot.initialise();

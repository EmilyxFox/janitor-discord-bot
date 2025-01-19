import { DiscordBot } from "./discord/client.ts";

const token = Deno.env.get("DISCORD_TOKEN");
const clientId = Deno.env.get("CLIENT_ID");

if (!token) {
  throw new Error('No discord token provided. Please set ENV "DISCORD_TOKEN"');
}
if (!clientId) {
  throw new Error('No client id provided. Please set ENV "CLIENT_ID"');
}

const bot = new DiscordBot({
  token: token,
  clientId: clientId,
});

bot.initialise();

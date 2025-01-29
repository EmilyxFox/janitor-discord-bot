import { DiscordBot } from "../discord/DiscordBot.ts";

export const shutdownGracefully = async (discordBot: DiscordBot) => {
  await discordBot.discordClient.destroy();
};

import type { Command } from "$types/command.ts";
import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { DiscordBot } from "../client.ts";

export class PingCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!");

  async run(
    interaction: ChatInputCommandInteraction,
    _botClient: DiscordBot,
  ): Promise<unknown> {
    return await interaction.reply("pong-2");
  }
}

import type { Command } from "$types/command.ts";
import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import type { DiscordBot } from "../client.ts";

export class TestEmbedCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("testembed")
    .setDescription("Test Embed");

  async run(
    interaction: ChatInputCommandInteraction,
    _botClient: DiscordBot
  ): Promise<unknown> {
    return await interaction.reply("pong");
  }
}

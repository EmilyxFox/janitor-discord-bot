import type { Command } from "$types/command.ts";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import type { DiscordBot } from "../client.ts";

export class CreatePoll implements Command {
  data = new SlashCommandBuilder()
    .setName("createPoll")
    .setDescription("Creates a poll with the given options and duration.");

  async run(
    interaction: ChatInputCommandInteraction,
    _botClient: DiscordBot
  ): Promise<unknown> {
    return await interaction.reply("test");
  }
}

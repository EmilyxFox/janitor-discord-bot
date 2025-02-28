import type { Command } from "$types/Command.ts";
import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export class PingCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with pong!");

  async run(interaction: ChatInputCommandInteraction): Promise<unknown> {
    return await interaction.reply("pong");
  }
}

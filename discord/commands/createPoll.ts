import type { Command } from "$types/command.ts";
import { type ChatInputCommandInteraction, InteractionContextType, PollLayoutType, SlashCommandBuilder } from "discord.js";
import { DiscordBot } from "../client.ts";

export class CreatePollCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("createpoll")
    .setDescription("Creates a poll with the given options and duration.")
    .setContexts(InteractionContextType.Guild)
    .addStringOption((opt) =>
      opt
        .setName("prompt")
        .setDescription("Set the title of your poll.")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("time")
        .setDescription("How long the poll should run for. Defaults to 12 hours.")
        .setRequired(false)
        .addChoices(
          { name: "1 hour", value: 1 },
          { name: "2 hours", value: 2 },
          { name: "4 hours", value: 4 },
          { name: "8 hours", value: 8 },
          { name: "12 hours", value: 12 },
          { name: "24 hours", value: 24 },
        )
    );

  async run(
    interaction: ChatInputCommandInteraction,
    _botClient: DiscordBot,
  ): Promise<unknown> {
    if (!interaction.channel?.isSendable()) {
      return;
    }
    if (interaction.channel.isDMBased()) {
      return interaction.reply("This command is only available in guilds.");
    }
    if (!interaction.channel.isTextBased()) {
      return;
    }

    try {
      (
        await (
          await interaction.reply({
            poll: {
              question: { text: `${interaction.options.getString("prompt")}` },
              answers: [
                { text: "Yes", emoji: "✅" },
                { text: "No", emoji: "❌" },
                { text: "Idc", emoji: "🤔" },
              ],
              allowMultiselect: false,
              duration: interaction.options.getNumber("category") ?? 12,
              layoutType: PollLayoutType.Default,
            },
            withResponse: false,
          })
        ).fetch()
      ).startThread({
        name: `${interaction.options.getString("prompt")}`,
        autoArchiveDuration: 1440,
        reason: "Poll discussion",
      });
    } catch (err) {
      return interaction.reply(`${err}`);
    }
  }
}

import type { Command } from "$types/Command.ts";
import {
  type ChatInputCommandInteraction,
  InteractionContextType,
  PermissionFlagsBits,
  PollData,
  PollLayoutType,
  SlashCommandBuilder,
  subtext,
  ThreadAutoArchiveDuration,
} from "discord.js";

export class CreatePollCommand implements Command {
  data = new SlashCommandBuilder()
    .setName("createpoll")
    .setDescription("Creates a poll with the given options and duration.")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.SendPolls)
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

  async run(interaction: ChatInputCommandInteraction): Promise<unknown> {
    if (!interaction.channel?.isSendable()) {
      return;
    }
    if (!interaction.channel.isTextBased()) {
      return;
    }
    if (interaction.channel.isDMBased()) {
      return interaction.reply("This command is only available in guilds.");
    }

    const question = interaction.options.getString("prompt");
    if (!question) return interaction.reply("No prompt supplied.");

    const duration = interaction.options.getNumber("time") ?? 12;

    try {
      const poll: PollData = {
        question: { text: question },
        answers: [
          { text: "Yes", emoji: "✅" },
          { text: "No", emoji: "❌" },
          { text: "Idc", emoji: "🤔" },
        ],
        allowMultiselect: false,
        duration,
        layoutType: PollLayoutType.Default,
      };

      const reply = await interaction.reply({ poll, withResponse: true });

      reply.resource?.message?.startThread({
        name: question,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
        reason: "Poll discussion",
      });
    } catch (_err) {
      return interaction.reply(`${subtext("An error occurred while running this command.")}`);
    }
  }
}
